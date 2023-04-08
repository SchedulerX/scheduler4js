import { Optional } from "sequelize";

export enum Status {
  ERROR = "500",
  SUCCESS = "200",
}

export type JobResultStatus = Status | string;

export interface JobLogEntityAttributes {
  id: BigInt;
  jobName: string;
  jobId: BigInt;
  jobTime: Date;
  job: JSON;
  resultStatus: JobResultStatus;
  failReason?: string | null;
  disabled?: boolean | null;
  createdAt: Date;
  updatedAt?: Date;
}

export type JobLogEntityOptionalAttributes = "failReason" | "disabled";
export type JobLogEntityCreationAttributes = Optional<
  JobLogEntityAttributes,
  JobLogEntityOptionalAttributes
>;
