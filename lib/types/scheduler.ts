import { JobModel } from "../models/model.job";
import { IJobDefinition } from "./job.definition";

export interface IScheduler {
  executeJobs(): Promise<void>;
  findNextJobToRun(): Promise<IJobDefinition>;
  localLockJob(job: IJobDefinition): void;
  globalLockJob(job: JobModel): Promise<void>;
  localUnLockJob(job: IJobDefinition): void;
  globalUnLockJob(job: JobModel): Promise<void>;
  disableJob(job: JobModel): Promise<boolean>;

  listen(event: "success", listener: (job: JobModel) => void): this;
  listen(event: "fail", listener: (error: Error, job: JobModel) => void): this;
  listen(event: "start", listener: (job: JobModel) => void): this;
  listen(event: "complete", listener: (job: JobModel) => void): this;
}
