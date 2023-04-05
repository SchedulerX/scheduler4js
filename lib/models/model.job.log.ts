import {
  JobLogEntityAttributes,
  JobLogEntityCreationAttributes,
} from "../types/job.log.entity.attributes";
import { ParentModel } from "./parent.model";

export class JobLogModel
  extends ParentModel<JobLogEntityAttributes, JobLogEntityCreationAttributes>
  implements JobLogEntityAttributes
{
  id!: BigInt;
  jobName!: string;
  jobId!: BigInt;
  jobTime!: Date;
  job!: JSON;
  resultStatus!: string;
  failReason?: string | null;
  disabledAt?: Date | null;
  disabled?: boolean | null;
  createdAt!: Date;
  updatedAt?: Date;
}