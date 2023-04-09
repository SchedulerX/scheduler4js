import { SchedulerContext } from "./core/context";
import { Database } from "./core/database";
import { SchedulerConfig } from "./types/scheduler.config";
import { TaskRunner } from "./core/runner";
import { IJobOption } from "./types/job.definition";
import { Options } from "sequelize";
import { ITaskRunner } from "./types/runner";

export class Scheduler {
  private runner: ITaskRunner | undefined;
  private constructor() {}

  public static async build(params: {
    dbConfig: Options;
    config: SchedulerConfig;
  }): Promise<Scheduler> {
    const scheduler = new Scheduler();

    const { dbConfig, config } = params;

    const db = new Database(dbConfig);
    await db.initJobLogTable();
    await db.initJobTable();

    const context = new SchedulerContext(db);
    scheduler.runner = new TaskRunner(context, config);

    if (config.kick) {
      scheduler.runner.tick();
    }

    return scheduler;
  }

  public async enqueueJob(config: IJobOption): Promise<void> {
    await this.runner!.enqueueJob(config);
  }

  public dequeueJob(name: string): void {
    this.runner!.dequeueJob(name);
  }
}
