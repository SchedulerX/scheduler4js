import { Sequelize } from "sequelize-typescript";
import { Options } from "sequelize/types";
import { JobModel } from "../models/model.job";
import { JobLogModel } from "../models/model.job.log";
export interface IDatabase {
  initJobTable(): Promise<IDatabase>;
  initJobLogTable(): Promise<IDatabase>;
  connect(options: Options): IDatabase;
  getJob(): typeof JobModel | undefined;
  getJobLog(): typeof JobLogModel | undefined;
}
