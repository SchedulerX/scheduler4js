import { Op } from "sequelize";
import { EventEmitter } from "stream";
import { JobModel } from "../models/model.job";
import { IJob } from "../types/job";
import { IJobDefinition, IJobOption } from "../types/job.definition";
import { SchedulerConfig } from "../types/scheduler.config";
import { SchedulerContext } from "./context";
import { DEFAULT_JOB_TYPE } from "../constants/job.constants";
import { ITaskRunner } from "../types/runner";

export class TaskRunner extends EventEmitter implements ITaskRunner {
  private context: SchedulerContext;
  private config: SchedulerConfig;
  constructor(context: SchedulerContext, config: SchedulerConfig) {
    super();
    this.context = context;
    this.config = config;
  }
  dequeueJob(name: string): ITaskRunner {
    this.context.dequeueJob(name);
    return this;
  }

  public tick(): void {
    setInterval(this.kickOffJobs.bind(this), this.config.frequency);
  }

  async enqueueJob(config: IJobOption): Promise<ITaskRunner> {
    this.context.enqueueJob(config);
    return this;
  }

  public async kickOffJobs(): Promise<void> {
    const jobDefinitions = this.context.getJobDefinitions();
    const lockExpire = new Date(Date.now() - this.config.lockLifetime);
    await Promise.all(
      Object.entries(jobDefinitions)
        .filter(
          ([name, def]) =>
            !def.option.type ||
            def.option.type === (this.config.type || DEFAULT_JOB_TYPE)
        )
        .map(
          async ([name, def]: [
            name: string,
            jobDefinition: IJobDefinition
          ]): Promise<void> => {
            const job = await this.context.getJobRepository().findOne({
              where: {
                type: this.config.type ?? { [Op.ne]: null },
                name,
                disabled: { [Op.ne]: true },
                [Op.or]: [
                  { lockedAt: null, nextTickAt: { [Op.lte]: new Date() } },
                  { lockedAt: { [Op.lte]: lockExpire } },
                ],
              },
            });
            if (job) {
              this.context.injectJob(job);
              await this.executeJob();
            }
          }
        )
    );
  }

  private async executeJob(): Promise<void> {
    const job = this.finJobToRun();
    if (!job) return;
    try {
      job.removeFromQueue();
      if (await this.preRunJob(job)) {
        job.moveToRunningJobs();
        await job.run();
        job.incrementSuccessCount();
        await job.saveLog();
      }
    } catch (err) {
      job.handleJobFailure();
      job.incrementFailCount();
      await job.saveLog(err);
    } finally {
      job.finalize();
      job.calculateNextTick();
      job.save();
      await this.postRunJob(job);
    }
  }

  private async preRunJob(job: IJob): Promise<boolean> {
    if (this.context.localLockJob(job)) {
      try {
        if (await this.globalLockJob(job)) {
          return true;
        }
      } catch (err) {
        console.debug(`Error while locking job, message: ${err}`);
        this.context.localUnLockJob(job);
      }
      return false;
    }
    console.debug(
      `Job with name :${job.getDefinition().option.name} cannot locked`
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

  private finJobToRun(): IJob {
    const jobQueue = this.context.getJobQueue() || [];
    const jobDefinitions = this.context.getJobDefinitions() || [];

    let index: number = 0;
    for (index = jobQueue.length - 1; index > 0; index -= 1) {
      if (
        jobDefinitions[jobQueue[index].getDefinition().option.name].option
          .concurrency! >
        jobDefinitions[jobQueue[index].getDefinition().option.name].running!
      ) {
        break;
      }
    }
    return jobQueue[index];
  }

  private async globalLockJob(job: IJob): Promise<boolean> {
    const now = new Date();
    job.getDefinition().lockedAt = now;
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
          name: job.getDefinition().option.name,
          lockedAt: job.getDefinition().lockedAt,
        },
      }
    );
    const globalLockedAt =
      this.context.getJobDefinitions()[job.getDefinition().option.name]
        .lockedAt;
    if (globalLockedAt == job.getDefinition().lockedAt) {
      this.context.getJobDefinitions()[
        job.getDefinition().option.name
      ].lockedAt = null;
    }
    job.getDefinition().lockedAt = null;
  }
}
