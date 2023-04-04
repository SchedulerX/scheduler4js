import humanInterval = require("human-interval");
import { Op } from "sequelize";
import { EventEmitter } from "stream";
import { JobModel } from "../models/model.job";
import { JobLogModel } from "../models/model.job.log";
import { IJob } from "../types/job";
import { IJobOption } from "../types/job.definition";
import { IScheduler } from "../types/scheduler";
import { SchedulerConfig } from "../types/scheduler.cofig";
import { SchedulerContext } from "./context";
import { Scheduler4JsFrequency } from "../enums/frequency";
import {
  DEFAULT_CONCURRENCY,
  DEFAULT_JOB_TYPE,
  DEFAULT_LOCK_LIMIT,
  DEFAULT_TIMEZONE,
} from "../constants/job.constants";

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
    };
    return this;
  }

  private async executeJobs(): Promise<void> {}

  public kickOfJobs(): void {
    setInterval(
      this.executeJobs.bind(this),
      this.convertHumanIntervalToFrequency()
    );
  }

  private async preRunJob(job: IJob): Promise<Scheduler4Js> {
    if (this.context.localLockJob(job)) {
      try {
        await this.globalLockJob(job);
      } catch (err) {
        console.debug(`Error while locking job, message: ${err}`);
        this.context.localUnLockJob(job);
        throw err;
      }
    }
    console.debug(`Job with name :${job.definition.option.name} locked`);
    return this;
  }

  private async postRunJob(job: IJob): Promise<Scheduler4Js> {
    this.context.localUnLockJob(job);
    await this.globalUnLockJob(job);
    return this;
  }

  public async disableJob(job: JobModel): Promise<boolean> {
    const jobRepository = this.context.getJobLogRepository();
    await jobRepository.update(
      { disabled: true, disabledAt: new Date() },
      { where: { id: job.id } }
    );
    return true;
  }

  private async findNextJobToRun(): Promise<IJob | null> {
    const jobQueue = this.context.getJobQueue() || [];
    if (jobQueue.length == 0) {
      return null;
    }
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

  private async globalLockJob(job: IJob): Promise<void> {
    const now = new Date().toUTCString();
    await this.context
      .getJobRepository()
      .update(
        { lockedAt: new Date(now) },
        { where: { name: job.definition.option.name } }
      );
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
          lockedAt: { [Op.gte]: lockDeadline },
        },
      }
    );
  }

  private convertHumanIntervalToFrequency() {
    return (humanInterval(this.config.frequency) ??
      humanInterval(Scheduler4JsFrequency.ONCE_IN_HALF_MINUTE)) as number;
  }
}
