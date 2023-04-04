import { Optional } from "sequelize";

export interface Context {}
export interface JobEntityAttributes {
  id: BigInt;
  context: Context;
  name: string;
  disabled: boolean;
  nextRunAt?: Date;
  lockedAt?: Date | null;
  priority: BigInt;
  data?: any;
  cron: string;
  timezone: string;
  lastRunAt?: Date;
  lastFinishedAt?: Date;
  failCount: BigInt;
  successCount: BigInt;
  status: string;
  type: string;
}

export type JobEntityOptionalAttributes =
  | "lastRunAt"
  | "data"
  | "lastRunAt"
  | "nextRunAt"
  | "lastFinishedAt"
  | "type";

export type JobEntityCreationAttributes = Optional<
  JobEntityAttributes,
  JobEntityOptionalAttributes
>;
