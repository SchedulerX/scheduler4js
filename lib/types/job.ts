/**
 * Author: Halil Baydar
 */

import { JobStatus } from "../enums/job.status";
import { JobModel } from "../models/model.job";
import { IJobDefinition } from "./job.definition";

// Define an interface called IJob
export interface IJob {
  // Define a function called shouldRun that returns a boolean value
  shouldRun(): boolean;

  // Define a function called saveLog that takes an optional parameter of any type and returns a Promise that resolves to void
  saveLog(err?: any): Promise<void>;

  // Define a function called incrementFailCount that takes no parameters and returns void
  incrementFailCount(): void;

  // Define a function called incrementSuccessCount that takes no parameters and returns void
  incrementSuccessCount(): void;

  // Define a function called removeFromQueue that takes no parameters and returns void
  removeFromQueue(): void;

  // Define a function called save that returns a Promise that resolves to a JobModel instance
  save(): Promise<JobModel>;

  // Define a function called moveToRunningJobs that takes no parameters and returns void
  moveToRunningJobs(): void;

  // Define a function called handleJobFailure that takes no parameters and returns void
  handleJobFailure(): void;

  // Define a function called calculateNextTick that takes no parameters and returns void
  calculateNextTick(): void;

  // Define a function called finalize that takes no parameters and returns void
  finalize(): void;

  // Define a function called changeJobStatus that takes a parameter of type JobStatus and returns void
  changeJobStatus(status: JobStatus): void;

  // Define a function called run that returns a Promise that resolves to void
  run(): Promise<void>;

  // Define a function called getDefinition that returns an IJobDefinition instance
  getDefinition(): IJobDefinition;

  // Define a function called getJobModel that returns an JobModel instance
  getJobModel(): JobModel;
}
