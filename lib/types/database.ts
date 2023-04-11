/**
 * Author: Halil Baydar
 */

import { Options } from "sequelize/types";
import { JobModel } from "../models/model.job";
import { JobLogModel } from "../models/model.job.log";

// Define an interface called IDatabase
export interface IDatabase {
  // Define a method called initJobTable that returns a Promise<IDatabase>
  // Initializes the job table in the database
  initJobTable(): Promise<IDatabase>;

  // Define a method called initJobLogTable that returns a Promise<IDatabase>
  // Initializes the job log table in the database
  initJobLogTable(): Promise<IDatabase>;

  // Define a method called connect that takes options of type Options and returns an IDatabase
  // Connects to the database with the given options
  connect(options: Options): IDatabase;

  // Define a method called getJob that returns a typeof JobModel or undefined
  // Retrieves the job model from the database
  getJob(): typeof JobModel | undefined;

  // Define a method called getJobLog that returns a typeof JobLogModel or undefined
  // Retrieves the job log model from the database
  getJobLog(): typeof JobLogModel | undefined;
}
