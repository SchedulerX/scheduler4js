import { JobStatus } from "../enums/job.status";
import { JobModel } from "../models/model.job";
import { IJobDefinition } from "./job.definition";

export interface IJob {
  saveLog(err?: any): Promise<void>;
  incrementFailCount(): void;
  incrementSuccessCount(): void;
  removeFromQueue(): void;
  save(): Promise<JobModel>;
  moveToRunningJobs(): void;
  handleJobFailure(): void;
  calculateNextTick(): void;
  finalize(): void;
  changeJobStatus(status: JobStatus): void;
  run(): Promise<void>;
  isExpired(): boolean;
  getDefinition(): IJobDefinition;
}
