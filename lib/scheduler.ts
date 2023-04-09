import { SchedulerContext } from "./core/context";
import { Database } from "./core/database";
import { SchedulerConfig } from "./types/scheduler.config";
import { TaskRunner } from "./core/runner";
import { IJobOption } from "./types/job.definition";
import { Options } from "sequelize";

export class Scheduler {
  private runner: TaskRunner;
  constructor(params: { dbConfig: Options; config: SchedulerConfig }) {
    const { dbConfig, config } = params;

    const db = new Database(dbConfig);
    const context = new SchedulerContext(db);
    this.runner = new TaskRunner(context, config);

    if (config.kick) {
      this.runner.tick();
    }
  }

  public async enqueueJob(config: IJobOption): Promise<void> {
    await this.runner.enqueueJob(config);
  }
}
