import { DbConfig } from "./database";

export interface SchedulerContextOption {
  start: boolean;
  cron: string;
  maxConcurrency: number;
  lockLimit: number;
  defaultLockLifetime?: number;
  dbConfig: DbConfig;
}
