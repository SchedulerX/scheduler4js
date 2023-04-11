/**
 * Author: Halil Baydar
 */

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
  jobId!: BigInt;
  jobTime!: Date;
  job!: JSON;
  resultStatus!: string;
  error?: string;
  disabledAt?: Date | null;
  createdAt!: Date;
  updatedAt?: Date;
}
