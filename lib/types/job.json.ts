import { JobStatus } from "../enums/job.status";
import { IJobAttributes, IJobDefinition } from "./job.definition";

export interface JobJSON extends IJobAttributes {
  // Define a required property called status of type JobStatus
  status: JobStatus;

  // Define an optional property called running of type number
  running?: number;

  // Define an optional property called lock of type number
  lock?: number;
}
