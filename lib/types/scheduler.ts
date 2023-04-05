import { JobModel } from "../models/model.job";
import { IJobOption } from "./job.definition";

export interface IScheduler {
  createJob(config: IJobOption): Promise<IScheduler>;
  kickOffJobs(): Promise<void>;
  disableJob(job: JobModel): Promise<boolean>;
}
