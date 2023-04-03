import { IJob } from "../types/job";
import { IJobDefinition } from "../types/job.definition";
import { ISchedulerRepository } from "../types/repository";

export class SchedulerContext<Job, JobLog> {
  private runningJobs: IJobDefinition[] = [];
  private jobDefinitions: { [key: string]: IJobDefinition } = {};
  private jobRepository: ISchedulerRepository<Job>;
  private jobLogRepository: ISchedulerRepository<JobLog>;
  private jobQueue: IJob[] = [];
  private lockedJobs: IJob[] = [];

  constructor(
    jobRepository: ISchedulerRepository<Job>,
    jobLoRepository: ISchedulerRepository<JobLog>
  ) {
    this.jobRepository = jobRepository;
    this.jobLogRepository = jobLoRepository;
  }

  public defineJob(definition: IJobDefinition): Promise<void> {
    return Promise.resolve();
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

  public getJobLogRepository(): ISchedulerRepository<Job> {
    return this.jobLogRepository;
  }
}
