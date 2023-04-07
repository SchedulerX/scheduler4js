import { SchedulerContext } from "./core/context";
import { Database } from "./core/database";
import { SchedulerConfig } from "./types/scheduler.config";
import { TaskRunner } from "./core/runner";
import { IJobOption } from "./types/job.definition";
import { DbConfig } from "./types/db.config";

export class Scheduler {
  private runner: TaskRunner;
  constructor(params: { dbConfig: DbConfig; config: SchedulerConfig }) {
    const { dbConfig, config } = params;

    const db = new Database(dbConfig);
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
