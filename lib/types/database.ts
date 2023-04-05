import { Sequelize } from "sequelize-typescript";
import { Options } from "sequelize/types";
import { JobModel } from "../models/model.job";
import { JobLogModel } from "../models/model.job.log";
export interface IDatabase {
  initJobTable(sequelize: Sequelize): typeof JobModel;
  initJobLogTable(sequelize: Sequelize): typeof JobLogModel;
  connect(options: Options): Sequelize;
  getJob(): typeof JobModel | undefined;
  getJobLog(): typeof JobLogModel | undefined;
}
