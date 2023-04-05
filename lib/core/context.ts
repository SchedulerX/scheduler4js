import { JobStatus } from "../enums/job.status";
import { JobModel } from "../models/model.job";
import { IJob } from "../types/job";
import { IJobDefinition } from "../types/job.definition";
import { ISchedulerRepository } from "../types/repository";
import * as parser from "cron-parser";

export class SchedulerContext<Job, JobLog> {
  private jobDefinitions: { [key: string]: IJobDefinition } = {};
  private jobRepository: ISchedulerRepository<Job>;
  private jobLogRepository: ISchedulerRepository<JobLog>;

  private jobQueue: IJob[] = [];
  private lockedJobs: IJob[] = [];
  private failedJobs: IJob[] = [];
  private runningJobs: IJob[] = [];

  constructor(
    jobRepository: ISchedulerRepository<Job>,
    jobLoRepository: ISchedulerRepository<JobLog>
  ) {
    this.jobRepository = jobRepository;
    this.jobLogRepository = jobLoRepository;
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

  public getJobRepository(): ISchedulerRepository<Job> {
    return this.jobRepository;
  }

  public getJobLogRepository(): ISchedulerRepository<JobLog> {
    return this.jobLogRepository;
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
      definition: this.jobDefinitions[job.name],
      moveToRunningJobs: async function (): Promise<void> {
        context.runningJobs.push(this);
      },
      moveToFailedJobs: async function (): Promise<void> {
        context.failedJobs.push(this);
      },
      changeJobStatus: async function (status: JobStatus): Promise<void> {
        this.definition.status = status;
        context.jobDefinitions[
          context.jobDefinitions[job.name].option.name
        ].status = status;
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
        let nextTick = cronTime.next().toDate();
        job.nextTickAt = nextTick;
      },
      save: async function (): Promise<JobModel> {
        return await job.save();
      },
    });
  }
}
