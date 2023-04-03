import { JobModel } from "../models/model.job";
import { IJobDefinition } from "./job.definition";

export interface IScheduler {
  defineJob(config: IJobDefinition): Promise<IScheduler>;
  kickOfJob(): void;
  disableJob(job: JobModel): Promise<boolean>;
}
