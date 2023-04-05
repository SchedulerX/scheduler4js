import { Optional } from "sequelize";

export interface Context {}
export interface JobEntityAttributes {
  id: BigInt;
  context: Context;
  name: string;
  disabled: boolean;
  nextTickAt?: Date;
  lockedAt?: Date | null;
  priority: BigInt;
  data?: any;
  cron: string;
  timezone: string;
  lastTickAt?: Date;
  lastFinishedAt?: Date;
  failCount: BigInt;
  successCount: BigInt;
  status: string;
  type: string;
}

export type JobEntityOptionalAttributes =
  | "data"
  | "lastTickAt"
  | "nextTickAt"
  | "lastFinishedAt"
  | "type";

export type JobEntityCreationAttributes = Optional<
  JobEntityAttributes,
  JobEntityOptionalAttributes
>;
