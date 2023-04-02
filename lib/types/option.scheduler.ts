import { Options } from "sequelize/types";

export interface SchedulerContextOption {
  start: boolean;
  cron: string;
  maxConcurrency: number;
  lockLimit: number;
  defaultLockLifetime?: number;
  dbConfig: Options;
}
