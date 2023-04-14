/**
 * Author: Halil Baydar
 */

import { SchedulerContext } from "./core/context";
import { Database } from "./core/database";
import { SchedulerConfig } from "./types/scheduler.config";
import { TaskRunner } from "./core/runner";
import { IJobOption } from "./types/job.definition";
import { Options } from "sequelize";
import { ITaskRunner } from "./types/runner";

export class Scheduler {
  /**
   * Declare a private member variable called runner of type ITaskRunner | undefined
   */
  private runner: ITaskRunner | undefined;

  /**
   * Define an async method called init that takes a params object with dbConfig and config properties
   * Initializes the database and task runner with the given configuration options
   *
   * @param params
   */
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
  }

  /**
   * Define an async method called enqueueJob that takes a config object of type IJobOption and returns void
   * Adds a new job to the task runner's queue
   * @param config
   */
  public enqueueJob(config: IJobOption): void {
    this.runner!.enqueueJob(config);
  }

  /**
   * Define a method called dequeueJob that takes a name string and returns void
   * Removes a job with the given name from the task runner's queue
   * @param name
   */
  public dequeueJob(name: string): void {
    this.runner!.dequeueJob(name);
  }

  public on(event: string, listener: (...args: any) => void): void {
    this.runner!.on(event, listener);
  }

  public once(event: string, listener: (...args: any) => void): void {
    this.runner!.once(event, listener);
  }
}
