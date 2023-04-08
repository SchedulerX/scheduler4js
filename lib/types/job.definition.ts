import { JobStatus } from "../enums/job.status";

export interface IJobOption {
  name: string;
  type?: string;
  timezone?: string;
  cron: string;
  concurrency?: number;
  lockLimit?: number;
  lockExpire?: number;
  data?: any;
  saveLog: boolean;
  priority: number;
  fn: (...args: any[]) => any;
}

export interface IJobDefinition {
  option: IJobOption;
  status: JobStatus;
  lockExpire: number;
  running?: number;
  lockedAt?: Date | null;
  lock?: number;
}
