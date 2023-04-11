/**
 * Author: Halil Baydar
 */

import { JobModel } from "../models/model.job";
import { IJobOption } from "./job.definition";

// Define an interface called ITaskRunner
export interface ITaskRunner {
  // Define a method called enqueueJob that takes an IJobOption object and returns an ITaskRunner object
  enqueueJob(config: IJobOption): ITaskRunner;

  // Define a method called dequeueJob that takes a string parameter and returns an ITaskRunner object
  dequeueJob(name: string): ITaskRunner;

  // Define a method called kickOffJobs that returns a Promise that resolves to void
  kickOffJobs(): Promise<void>;

  // Define a method called disableJob that takes a JobModel object and returns a Promise that resolves to a boolean
  disableJob(job: JobModel): Promise<boolean>;

  // Define a method called tick that returns void
  tick(): void;
}
