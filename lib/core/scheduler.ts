import { Op } from "sequelize";
import { EventEmitter } from "stream";
import { JobModel } from "../models/model.job";
import { JobLogModel } from "../models/model.job.log";
import { IJob } from "../types/job";
import { IJobDefinition, IJobOption } from "../types/job.definition";
import { IScheduler } from "../types/scheduler";
import { SchedulerConfig } from "../types/scheduler.cofig";
import { SchedulerContext } from "./context";
import {
  DEFAULT_CONCURRENCY,
  DEFAULT_JOB_TYPE,
  DEFAULT_LOCK_EXPIRE,
  DEFAULT_LOCK_LIMIT,
  DEFAULT_TIMEZONE,
} from "../constants/job.constants";
import { JobStatus } from "../enums/job.status";

export class Scheduler4Js extends EventEmitter implements IScheduler {
  private context: SchedulerContext<JobModel, JobLogModel>;
  private config: SchedulerConfig;
  constructor(
    context: SchedulerContext<JobModel, JobLogModel>,
    config: SchedulerConfig
  ) {
    super();
    this.context = context;
    this.config = config;
  }

  public tick(): void {
    setInterval(this.kickOffJobs.bind(this), this.config.frequency);
  }

  async createJob(config: IJobOption): Promise<IScheduler> {
    const jobRepository = this.context.getJobRepository();
    const jobDefinitions = this.context.getJobDefinitions();
    let job: JobModel = await jobRepository.findOne({
      where: { name: config.name, disabled: { [Op.ne]: true } },
    });
    if (job) {
      await jobRepository.update(
        {
          cron: config.cron,
          data: config.data,
        },
        { where: { id: job.id } }
      );
    } else {
      job = await jobRepository.save(
        {
          name: config.name,
          data: config.data,
          disabled: false,
          cron: config.cron,
          timezone: config.timezone || DEFAULT_TIMEZONE,
          type: config.type ?? DEFAULT_JOB_TYPE,
        },
        { returning: true }
      );
    }
    jobDefinitions[config.name] = {
      running: 0,
      lock: 0,
      option: {
        ...config,
        concurrency: config.concurrency || DEFAULT_CONCURRENCY,
        lockLimit: config.lockLimit || DEFAULT_LOCK_LIMIT,
      },
      status: JobStatus.WAITING,
      lockExpire: config.lockExpire || DEFAULT_LOCK_EXPIRE,
    };
    return this;
  }

  public async kickOffJobs(): Promise<void> {
    const jobDefinitions = this.context.getJobDefinitions();
    const lockExpire = new Date(Date.now() - this.config.lockLifetime);
    await Promise.all(
      Object.entries(jobDefinitions).map(
        async ([name, jobDefinition]: [
          name: string,
          jobDefinition: IJobDefinition
        ]): Promise<void> => {
          const job: JobModel = await this.context.getJobRepository().findOne({
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
        job.finalize();
        job.calculateNextTick();
        job.save();
      }
    } catch (err) {
      job.moveToFailedJobs();
    } finally {
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
    console.debug(`Job with name :${job.definition.option.name} cannot locked`);
    return false;
  }

  private async postRunJob(job: IJob): Promise<Scheduler4Js> {
    this.context.localUnLockJob(job);
    await this.globalUnLockJob(job);
    return this;
  }

  public async disableJob(job: JobModel): Promise<boolean> {
    const jobRepository = this.context.getJobRepository();
    await jobRepository.update({ disabled: true }, { where: { id: job.id } });
    this.context.removeDefinition(job.name);
    return true;
  }

  private finJobToRun(): IJob {
    const jobQueue = this.context.getJobQueue() || [];
    const jobDefinitions = this.context.getJobDefinitions() || [];

    let index: number = 0;
    for (index = jobQueue.length - 1; index > 0; index -= 1) {
      if (
        jobDefinitions[jobQueue[index].definition.option.name].option
          .concurrency! >
        jobDefinitions[jobQueue[index].definition.option.name].running!
      ) {
        break;
      }
    }
    return jobQueue[index];
  }

  private async globalLockJob(job: IJob): Promise<boolean> {
    const now = new Date().toUTCString();
    const count = await this.context
      .getJobRepository()
      .update(
        { lockedAt: new Date(now) },
        { where: { name: job.definition.option.name } }
      );
    return count > 0;
  }

  private async globalUnLockJob(job: IJob): Promise<void> {
    const lockDeadline = new Date(
      Date.now().valueOf() - this.config.lockLifetime
    ).toUTCString();
    await this.context.getJobRepository().update(
      { lockedAt: null },
      {
        where: {
          name: job.definition.option.name,
          lockedAt: { [Op.lte]: lockDeadline },
        },
      }
    );
  }
}
