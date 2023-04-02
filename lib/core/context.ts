import { IJobDefinition } from "../types/job.definition";
import { ISchedulerRepository } from "../types/repository";

export class SchedulerContext<Job, JobLog> {
  private runningJobs: IJobDefinition[] = [];
  private jobDefinitions: IJobDefinition[] = [];
  private jobRepository: ISchedulerRepository<Job>;
  private jobLogRepository: ISchedulerRepository<JobLog>;

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
}
