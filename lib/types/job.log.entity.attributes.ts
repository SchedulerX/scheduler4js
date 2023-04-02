import { Optional } from "./optional";

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
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}

export type JobLogEntityOptionalAttributes = "failReason" | "cancelledAt";
export type JobLogEntityCreationAttributes = Optional<
  JobLogEntityAttributes,
  JobLogEntityOptionalAttributes
>;
