import { CronExpression } from "./constants/QSchedulerExpression";
import { SchedulerContext } from "./core/context";
import { Database } from "./core/database";
import { Sequelize } from "sequelize-typescript";
import { SchedulerConfig } from "./types/scheduler.cofig";
import { TaskRunner } from "./core/runner";

export class Scheduler4Js {
  runner;
  constructor(connection: Sequelize, config: SchedulerConfig) {
    const db = new Database();
    db.initJobTable(connection);
    db.initJobLogTable(connection);

    const context = new SchedulerContext(db);
    this.runner = new TaskRunner(context, config);
    this.runner.tick();
  }

  async example() {
    await this.runner.createJob({
      name: "halil",
      cron: CronExpression.EVERY_SECOND,
      concurrency: 2,
      lockLimit: 1,
      fn: (): void => {
        console.log("@@@@@@@@");
      },
    });
  }
}
