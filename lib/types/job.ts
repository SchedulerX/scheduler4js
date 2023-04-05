import { JobStatus } from "../enums/job.status";
import { JobModel } from "../models/model.job";
import { IJobDefinition } from "./job.definition";

export interface IJob {
  removeFromQueue(): void;
  save(): Promise<JobModel>;
  moveToRunningJobs(): Promise<void>;
  moveToFailedJobs(): Promise<void>;
  calculateNextTick(): void;
  finalize(): void;
  changeJobStatus(status: JobStatus): Promise<void>;
  run(): Promise<void>;
  isExpired(): boolean;
  definition: IJobDefinition;
}
