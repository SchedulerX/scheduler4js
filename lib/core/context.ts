import { JobStatus } from "../enums/job.status";
import { IJob } from "../types/job";
import { IJobDefinition } from "../types/job.definition";
import { ISchedulerRepository } from "../types/repository";

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

  public injectJob(jobDefinition: IJobDefinition): void {
    const context = this;
    this.jobQueue.push({
      definition: jobDefinition,
      addToRunningJobs: async function (): Promise<void> {
        const index = context.runningJobs.indexOf(this);
        if (index > -1) {
          context.runningJobs.push(this);
        }
      },
      addToFailedJobs: async function (): Promise<void> {
        context.failedJobs.push(this);
      },
      changeJobStatus: async function (status: JobStatus): Promise<void> {
        this.definition.status = status;
        context.jobDefinitions[jobDefinition.option.name].status = status;
      },
      run: async function (): Promise<void> {
        await this.definition.option.fn();
      },
      isExpired: function (): boolean {
        const lockDeadline = new Date(Date.now() - this.definition.lockExpire);
        return (
          (context.jobDefinitions[jobDefinition.option.name].lockedAt ||
            Date.now()) < lockDeadline
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
      calculateNextTick: function (): void {},
    });
  }
}
