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
  type!: string;
  name!: string;
  disabled!: boolean;
  nextRunAt!: Date;
  lockedAt?: Date | null | undefined;
  priority!: BigInt;
  data?: any;
  cron!: string;
  timezone!: string;
  lastRunAt?: Date | undefined;
  lastFinishedAt?: Date | undefined;
  failCount!: BigInt;
  successCount!: BigInt;
  status!: string;
}
