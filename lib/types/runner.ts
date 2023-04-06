import { JobModel } from "../models/model.job";
import { IJobOption } from "./job.definition";

export interface ITaskRunner {
  createJob(config: IJobOption): Promise<ITaskRunner>;
  kickOffJobs(): Promise<void>;
  disableJob(job: JobModel): Promise<boolean>;
}