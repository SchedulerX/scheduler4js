/**
 * Author: Halil Baydar
 */

import { JobStatus } from "../enums/job.status";

export interface IJobAttributes {
  // Define a required property called name of type string
  name: string;

  // Define an optional property called type of type string
  type?: string;

  // Define an optional property called timezone of type string
  timezone?: string;

  // Define a required property called cron of type string
  cron: string;

  // Define an optional property called concurrency of type number
  concurrency?: number;

  // Define an optional property called lockLimit of type number
  lockLimit?: number;

  // Define an optional property called data of type any
  data?: any;

  // Define a required property called saveLog of type boolean
  saveLog: boolean;

  // Define a required property called priority of type number
  priority: number;
}
// Define an interface called IJobOption
export interface IJobOption extends IJobAttributes {
  // Define a required property called fn of type function that takes any number of arguments and returns any type
  fn: (...args: any[]) => any;
}

// Define an interface called IJobDefinition
export interface IJobDefinition {
  // Define a required property called option of type IJobOption
  option: IJobOption;

  // Define a required property called status of type JobStatus
  status: JobStatus;

  // Define an optional property called running of type number
  running?: number;

  // Define an optional property called lock of type number
  lock?: number;
}
