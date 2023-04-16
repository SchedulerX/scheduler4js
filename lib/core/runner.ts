/**
 * Author: Halil Baydar
 */

import { Op } from "sequelize";
import { EventEmitter } from "stream";
import { JobModel } from "../models/model.job";
import { IJob } from "../types/job";
import { IJobDefinition, IJobOption } from "../types/job.definition";
import { SchedulerConfig } from "../types/scheduler.config";
import { SchedulerContext } from "./context";
import { ITaskRunner } from "../types/runner";
import {
  DEFAULT_FREQUENCY,
  DEFAULT_JOB_TYPE,
  DEFAULT_LOCK_EXPIRE,
} from "../constants/job.constants";

export class TaskRunner extends EventEmitter implements ITaskRunner {
  private context: SchedulerContext;
  private config: SchedulerConfig;
  constructor(context: SchedulerContext, config: SchedulerConfig) {
    super();
    this.context = context;
    this.config = {
      frequency: config.frequency || DEFAULT_FREQUENCY,
      type: config.type || DEFAULT_JOB_TYPE,
      kick: config.kick || true,
      lockLifetime: config.lockLifetime || DEFAULT_LOCK_EXPIRE,
    };

    if (this.config.kick != false) {
      this.tick();
    }
  }

  public dequeueJob(name: string): ITaskRunner {
    this.context.dequeueJob(name);
    return this;
  }

  public tick(): void {
    setInterval(this.kickOffJobs.bind(this), this.config.frequency);
  }

  public enqueueJob(config: IJobOption): ITaskRunner {
    this.context.enqueueJob(config);
    return this;
  }

  public async kickOffJobs(): Promise<void> {
    const jobDefinitions = this.context.getFilteredJobDefinitions(this.config);
    const lockExpire = new Date(Date.now() - this.config.lockLifetime!);
    await Promise.all(
      jobDefinitions.map(
        async ([name, def]: [
          name: string,
          jobDefinition: IJobDefinition
        ]): Promise<void> => {
          const [count, jobs] = await this.context.getJobRepository().update(
            {
              lockedAt: new Date(),
            },
            {
              where: {
                [Op.or]: [{ type: this.config.type! }, { type: null }],
                name,
                disabled: { [Op.ne]: true },
                [Op.or]: [
                  { lockedAt: null, nextTickAt: { [Op.lte]: new Date() } },
                  { lockedAt: { [Op.lte]: lockExpire } },
                ],
              },
              returning: true,
            }
          );
          if (jobs && jobs.length > 0) {
            this.context.injectJob(jobs[0]);
            await this.executeJob();
          }
        }
      )
    );
  }

  private async executeJob(): Promise<void> {
    const job = this.findJobToRun();
    if (!job) return;
    this.emit("begin", job);
    job.removeFromQueue();
    if (await this.preRunJob(job)) {
      job.moveToRunningJobs();
      const childRunner = job.run();
      childRunner.send(job.getDefinition().option.fn.toString());
      childRunner.on("message", async (message: { err?: string }) => {
        if (message?.err) {
          job.handleJobFailure();
          job.incrementFailCount();
          await job.saveLog(message.err);
          this.emit("fail", message.err, job);
        }
      });
      childRunner.on("exit", async (code, signal) => {
        if (code == 0) {
          this.emit("success", job);
          job.incrementSuccessCount();
          await job.saveLog();
          this.emit("logSaved", job);
        }
        job.finalize();
        job.calculateNextTick();
        await job.save();
        await this.postRunJob(job);
        this.emit("completed", job);
      });
    }
  }

  private async preRunJob(job: IJob): Promise<boolean> {
    if (job.shouldRun()) {
      if (this.context.localLockJob(job)) {
        return true;
      }
    }
    console.debug(
      `Job with name :${job.getDefinition().option.name} cannot be locked`
    );
    return false;
  }

  private async postRunJob(job: IJob): Promise<ITaskRunner> {
    this.context.localUnLockJob(job);
    await this.globalUnLockJob(job);
    return this;
  }

  public async disableJob(job: JobModel): Promise<boolean> {
    const jobRepository = this.context.getJobRepository();
    await jobRepository.update<any>(
      { disabled: true },
      { where: { id: job.id } }
    );
    this.context.removeDefinition(job.name);
    return true;
  }

  private findJobToRun(): IJob | undefined {
    const jobQueue = this.context.getJobQueue() || [];
    const jobDefinitions = this.context.getJobDefinitions() || [];

    return jobQueue.find(
      (job) =>
        jobDefinitions[job.getDefinition().option.name].option.concurrency! >
        jobDefinitions[job.getDefinition().option.name].running!
    );
  }

  private async globalLockJob(job: IJob): Promise<boolean> {
    const now = new Date();
    const [count] = await this.context
      .getJobRepository()
      .update(
        { lockedAt: now },
        { where: { name: job.getDefinition().option.name } }
      );
    return count > 0;
  }

  private async globalUnLockJob(job: IJob): Promise<void> {
    await this.context.getJobRepository().update(
      { lockedAt: null },
      {
        where: {
          name: job.getJobModel().name,
          lockedAt: job.getJobModel().lockedAt,
        },
      }
    );
  }
}
