import { JobModel } from "../models/model.job";
import { IJobOption } from "./job.definition";

export interface IScheduler {
  createJob(config: IJobOption): Promise<IScheduler>;
  kickOfJobs(): void;
  disableJob(job: JobModel): Promise<boolean>;
}
