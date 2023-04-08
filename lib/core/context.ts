import { Model } from "sequelize";
import { JobModel } from "../models/model.job";
import { IJob } from "../types/job";
import { IJobDefinition } from "../types/job.definition";
import { JobLogModel } from "../models/model.job.log";
import { IDatabase } from "../types/database";
import { Job } from "./job";

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
}
