import {
  Context,
  JobEntityAttributes,
  JobEntityCreationAttributes,
} from "../types/job.entity.attributes";
import { ParentModel } from "./parent.model";

export class JobModel
  extends ParentModel<JobEntityAttributes, JobEntityCreationAttributes>
  implements JobEntityAttributes
{
  id!: BigInt;
  context!: Context;
  name!: string;
  type!: string;
  disabled!: boolean;
  nextRunAt!: Date;
  lockedAt?: Date | null | undefined;
  priority!: BigInt;
  data?: any;
  cron!: string;
  timezone!: string;
  failCount!: BigInt;
  successCount!: BigInt;
  status!: string;
}
