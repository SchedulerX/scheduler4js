import { Model } from "sequelize";
import { JobStatus } from "../enums/job.status";
import { JobModel } from "../models/model.job";
import { IJob } from "../types/job";
import { IJobDefinition } from "../types/job.definition";
import * as parser from "cron-parser";
import { JobLogModel } from "../models/model.job.log";
import { IDatabase } from "../types/database";
import { Status } from "../types/job.log.entity.attributes";

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

  public localLockJob(job: IJob): boolean {
    const jobDefinitions = this.getJobDefinitions();
    if (
      jobDefinitions[job.definition.option.name].lock! <
      jobDefinitions[job.definition.option.name].option.lockLimit!
    ) {
      this.getLockedJobs().push(job);
      jobDefinitions[job.definition.option.name].lock!++;
      return true;
    }
    return false;
  }

  public localUnLockJob(job: IJob): void {
    const index = this.getLockedJobs().indexOf(job);
    const jobDefinitions = this.getJobDefinitions();
    if (index > -1) {
      this.getLockedJobs().splice(index, 1);
      if (jobDefinitions[job.definition.option.name].lock! > 0) {
        jobDefinitions[job.definition.option.name].lock!--;
      }
    }
  }

  public injectJob(job: JobModel): void {
    const context = this;
    this.jobQueue.push({
      definition: context.jobDefinitions[job.name],
      moveToRunningJobs: async function (): Promise<void> {
        context.runningJobs.push(this);
        this.changeJobStatus(JobStatus.RUNNING);
      },
      moveToFailedJobs: async function (): Promise<void> {
        context.failedJobs.push(this);
        this.changeJobStatus(JobStatus.FAILED);
      },
      changeJobStatus: async function (status: JobStatus): Promise<void> {
        this.definition.status = status;
        context.jobDefinitions[
          context.jobDefinitions[job.name].option.name
        ].status = status;
        this.definition.status = status;
      },
      run: async function (): Promise<void> {
        await this.definition.option.fn();
      },
      isExpired: function (): boolean {
        const lockDeadline = new Date(Date.now() - this.definition.lockExpire);
        return (
          (context.jobDefinitions[context.jobDefinitions[job.name].option.name]
            .lockedAt || Date.now()) < lockDeadline
        );
      },
      finalize: function (): void {
        const index = context.runningJobs.indexOf(this);
        if (index > -1) {
          context.runningJobs.splice(index, 1);
        }
        const indexOfQueue = context.jobQueue.indexOf(this);
        if (indexOfQueue > -1) {
          context.jobQueue.splice(index, 1);
        }
        this.changeJobStatus(JobStatus.FINISHED);
      },
      calculateNextTick: function (): void {
        const expression = this.definition.option.cron!;
        const tz = this.definition.option.timezone;
        const currentDate = job.lastTickAt;
        let cronTime = parser.parseExpression(expression, {
          currentDate,
          tz,
        });
        job.lastTickAt = job.nextTickAt;
        const nextTick = cronTime.next().toDate();
        job.nextTickAt = nextTick;
      },
      save: async function (): Promise<JobModel> {
        return await job.save();
      },
      removeFromQueue: function (): void {
        const index = context.jobQueue.indexOf(this);
        if (index > -1) {
          context.jobQueue.splice(index, 1);
        }
      },
      incrementFailCount: function (): void {
        job.failCount = (((job.failCount as any) || 0) + 1) as bigint;
      },
      incrementSuccessCount: function (): void {
        job.successCount = ((job.successCount as any) || 0) + 1;
      },
      saveLog: async function (err?: any): Promise<void> {
        await context.getJobLogRepository().create<any>({
          jobName: job.name,
          jobId: job.id,
          jobTime: new Date(),
          job: this.definition,
          resultStatus: err ? Status.ERROR : Status.SUCCESS,
          failReason: err ?? null,
        });
      },
    });
  }
}
