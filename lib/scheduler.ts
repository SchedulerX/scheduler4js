import { SchedulerContext } from "./core/context";
import { Database } from "./core/database";
import { SchedulerConfig } from "./types/scheduler.config";
import { TaskRunner } from "./core/runner";
import { IJobOption } from "./types/job.definition";
import { Options } from "sequelize";
import { ITaskRunner } from "./types/runner";

export class Scheduler {
  private runner: ITaskRunner | undefined;
  constructor() {}

  async init(params: {
    dbConfig: Options;
    config: SchedulerConfig;
  }): Promise<void> {
    const { dbConfig, config } = params;
    const db = new Database(dbConfig);
    await db.initJobTable();
    await db.initJobLogTable();
    const context = new SchedulerContext(db);
    this.runner = new TaskRunner(context, config);

    if (config.kick) {
      this.runner.tick();
    }
  }

  public async enqueueJob(config: IJobOption): Promise<void> {
    await this.runner!.enqueueJob(config);
  }

  public dequeueJob(name: string): void {
    this.runner!.dequeueJob(name);
  }
}
