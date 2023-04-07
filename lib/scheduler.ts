import { CronExpression } from "./constants/QSchedulerExpression";
import { SchedulerContext } from "./core/context";
import { Database } from "./core/database";
import { Sequelize } from "sequelize-typescript";
import { SchedulerConfig } from "./types/scheduler.cofig";
import { TaskRunner } from "./core/runner";
import { IJob } from "./types/job";
import { IJobOption } from "./types/job.definition";

export class Scheduler {
  private runner: TaskRunner;
  constructor(params: { connection: Sequelize; config: SchedulerConfig }) {
    const { connection, config } = params;
    const db = new Database();
    db.initJobTable(connection);
    db.initJobLogTable(connection);

    const context = new SchedulerContext(db);
    this.runner = new TaskRunner(context, config);

    if (config.kick) {
      this.runner.tick();
    }
  }

  public createJob(config: IJobOption) {
    this.runner.createJob(config);
  }
}
