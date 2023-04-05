import { SchedulerContext } from "./core/context";
import { Database } from "./core/database";
import { JobModel } from "./models/model.job";
import { JobLogModel } from "./models/model.job.log";

export class Scheduler4Js {
  constructor(config: any) {
    const { sequelize } = config;
    const db = new Database();
    db.initJobTable(sequelize);
    db.initJobLogTable(sequelize);
    const context = new SchedulerContext(db);
  }
}
