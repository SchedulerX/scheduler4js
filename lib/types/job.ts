import { JobStatus } from "../enums/job.status";
import { IJobDefinition } from "./job.definition";

export interface IJob {
  moveToRunningJobs(): Promise<void>;
  moveToFailedJobs(): Promise<void>;
  calculateNextTick(): void;
  finalize(): void;
  changeJobStatus(status: JobStatus): Promise<void>;
  run(): Promise<void>;
  isExpired(): boolean;
  definition: IJobDefinition;
}
