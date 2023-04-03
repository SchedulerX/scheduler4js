import humanInterval = require("human-interval");
import { EventEmitter } from "stream";
import { JobModel } from "../models/model.job";
import { JobLogModel } from "../models/model.job.log";
import { IJob } from "../types/job";
import { IJobDefinition } from "../types/job.definition";
import { IScheduler } from "../types/scheduler";
import { SchedulerConfig } from "../types/scheduler.cofig";
import { SchedulerContext } from "./context";

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

  async defineJob(config: IJobDefinition): Promise<IScheduler> {
    await this.context.defineJob(config);
    return this;
  }
  private async executeJobs(): Promise<void> {}

  public kickOfJob(): void {
    setInterval(
      this.executeJobs.bind(this),
      this.convertHumanIntervalToFrequency()
    );
  }
  async disableJob(job: JobModel): Promise<boolean> {
    const jobRepository = this.context.getJobLogRepository();
    await jobRepository.update<JobLogModel>(
      { disabled: true, disabledAt: new Date() },
      { where: { id: job.id } }
    );
    return true;
  }

  private async findNextJobToRun(): Promise<IJob | null> {
    const jobDefinitions = this.context.getJobDefinitions() || [];
    const jobQueue = this.context.getJobQueue() || [];
    let index: number = 0;
    for (index = jobQueue.length - 1; index > 0; index -= 1) {
      if (
        jobDefinitions[jobQueue[index].definition.name].concurrency >
        jobDefinitions[jobQueue[index].definition.name].running
      ) {
        break;
      }
    }
    return jobQueue[index];
  }

  private localLockJob(job: IJob): void {
    this.context.getLockedJobs().push(job);
  }

  private localUnLockJob(job: IJob): void {
    const index = this.context.getLockedJobs().indexOf(job);
    if (index > -1) {
      this.context.getLockedJobs().splice(index, 1);
    }
  }

  private async globalLockJob(job: JobModel): Promise<void> {
    const now = Date.now();
    this.context
      .getJobLogRepository()
      .update({ lockedAt: now }, { where: { id: job.id } });
  }

  private async globalUnLockJob(job: JobModel): Promise<void> {
    this.context
      .getJobLogRepository()
      .update({ lockedAt: null }, { where: { id: job.id } });
  }

  private convertHumanIntervalToFrequency() {
    return (humanInterval(this.config.frequency) ??
      humanInterval("30 seconds")) as number;
  }
}
