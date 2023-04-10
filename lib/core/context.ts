import { JobModel } from "../models/model.job";
import { IJob } from "../types/job";
import { IJobDefinition, IJobOption } from "../types/job.definition";
import { JobLogModel } from "../models/model.job.log";
import { IDatabase } from "../types/database";
import { Job } from "./job";
import {
  DEFAULT_CONCURRENCY,
  DEFAULT_JOB_TYPE,
  DEFAULT_LOCK_EXPIRE,
  DEFAULT_LOCK_LIMIT,
  DEFAULT_PRIORITY,
  DEFAULT_TIMEZONE,
} from "../constants/job.constants";
import { JobStatus } from "../enums/job.status";
import { Op } from "sequelize";
import * as parser from "cron-parser";
import { SchedulerConfig } from "../types/scheduler.config";

export class SchedulerContext {
  private jobDefinitions: { [key: string]: IJobDefinition } = {};

  private jobQueue: IJob[] = [];
  private lockedJobs: IJob[] = [];
  private failedJobs: IJob[] = [];
  private runningJobs: IJob[] = [];

  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
  }

  public getJobDefinitions(): { [key: string]: IJobDefinition } {
    return this.jobDefinitions;
  }

  public getFilteredJobDefinitions(
    config: SchedulerConfig
  ): [string, IJobDefinition][] {
    return Object.entries(this.jobDefinitions).filter(
      ([name, def]): boolean =>
        !def.option.type ||
        def.option.type === (config.type || DEFAULT_JOB_TYPE)
    );
  }

  public getRunningJobs(): IJob[] {
    return this.runningJobs;
  }

  public getJobQueue(): IJob[] {
    return this.jobQueue;
  }

  public getLockedJobs(): IJob[] {
    return this.lockedJobs;
  }

  public getFailedJobs(): IJob[] {
    return this.failedJobs;
  }

  public getJobRepository(): typeof JobModel {
    return this.db.getJob()!;
  }

  public getJobLogRepository(): typeof JobLogModel {
    return this.db.getJobLog()!;
  }

  public removeDefinition(name: string): void {
    delete this.jobDefinitions[name];
  }

  dequeueJob(name: string) {
    this.removeDefinition(name);
  }

  public localLockJob(job: IJob): boolean {
    const jobDefinitions = this.getJobDefinitions();
    if (
      jobDefinitions[job.getDefinition().option.name].lock! <
      jobDefinitions[job.getDefinition().option.name].option.lockLimit!
    ) {
      this.getLockedJobs().push(job);
      jobDefinitions[job.getDefinition().option.name].lock!++;
      return true;
    }
    return false;
  }

  public localUnLockJob(job: IJob): void {
    const index = this.getLockedJobs().indexOf(job);
    const jobDefinitions = this.getJobDefinitions();
    if (index > -1) {
      this.getLockedJobs().splice(index, 1);
      if (jobDefinitions[job.getDefinition().option.name].lock! > 0) {
        jobDefinitions[job.getDefinition().option.name].lock!--;
      }
    }
  }

  public injectJob(job: JobModel): void {
    const jobInstance = new Job(this, job);
    this.jobQueue.push(jobInstance);
  }

  async enqueueJob(config: IJobOption): Promise<void> {
    let job = await this.getJobRepository().findOne({
      where: { name: config.name, disabled: { [Op.ne]: true } },
    });
    const payload = {
      cron: config.cron,
      data: config.data,
      disabled: false,
      timezone: config.timezone || DEFAULT_TIMEZONE,
      type: config.type || DEFAULT_JOB_TYPE,
      priority: config.priority || DEFAULT_PRIORITY,
      status: JobStatus.RUNNING,
    };
    if (job) {
      await this.getJobRepository().update(
        {
          ...payload,
          nextTickAt: this.computeNextTick(job),
        },
        { where: { id: job.id } }
      );
    } else {
      job = await this.getJobRepository().create<any>({
        ...payload,
        name: config.name,
        nextTickAt: this.computeNextTick({
          cron: config.cron,
          timezone: config.timezone,
        }),
      });
    }
    this.createJobDefinition(config);
  }

  private computeNextTick(job: Partial<JobModel>): Date {
    let cronTime = parser.parseExpression(job.cron!, {
      currentDate: new Date(),
      tz: job.timezone,
    });
    return cronTime.next().toDate();
  }

  private createJobDefinition(config: IJobOption): void {
    this.jobDefinitions[config.name] = {
      running: 0,
      lock: 0,
      option: {
        ...config,
        concurrency: config.concurrency || DEFAULT_CONCURRENCY,
        lockLimit: config.lockLimit || DEFAULT_LOCK_LIMIT,
        type: config.type || DEFAULT_JOB_TYPE,
        lockExpire: config.lockExpire || DEFAULT_LOCK_EXPIRE,
        priority: config.priority || DEFAULT_PRIORITY,
      },
      status: JobStatus.WAITING,
    };

    this.reorderJobDefinitions();
  }

  private reorderJobDefinitions(): void {
    this.jobDefinitions = Object.entries(this.jobDefinitions)
      .sort(([name1, def1], [name2, def2]): number => {
        if (def1.option.priority > def2.option.priority) {
          return 1;
        } else if (def1.option.priority < def2.option.priority) {
          return -1;
        }
        return 0;
      })
      .reduce((acc, [name, def]): { [key: string]: IJobDefinition } => {
        (acc as any)[name] = def;
        return acc;
      }, {});
  }
}
