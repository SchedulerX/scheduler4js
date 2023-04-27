/**
 * Author: Halil Baydar
 */

import { JobStatus } from "../enums/job.status";
import { JobModel } from "../models/model.job";
import { IJob } from "../types/job";
import { IJobDefinition } from "../types/job.definition";
import { JobJSON } from "../types/job.json";
import { Status } from "../types/job.log.entity.attributes";
import { SchedulerContext } from "./context";
import * as parser from "cron-parser";

//eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require("moment");

export class Job implements IJob {
  private context;
  private definition;
  private jobModel;

  constructor(context: SchedulerContext, jobModel: JobModel) {
    this.context = context;
    this.jobModel = jobModel;
    this.definition = this.context.getJobDefinitions()[jobModel.name];
  }

  public toJSON(): JobJSON {
    return {
      running: this.definition.running,
      lock: this.definition.lock,
      status: this.definition.status,
      name: this.definition.option.name,
      concurrency: this.definition.option.concurrency,
      type: this.definition.option.type,
      timezone: this.definition.option.timezone,
      cron: this.definition.option.cron,
      lockLimit: this.definition.option.lockLimit,
      saveLog: this.definition.option.saveLog,
      priority: this.definition.option.priority,
    };
  }

  public shouldRun(): boolean {
    const now = new Date();
    const currentTime = moment(now).tz(this.jobModel.timezone);
    const nextTickAt = moment(this.jobModel.lastTickAt || now).tz(
      this.jobModel.timezone
    );
    return nextTickAt.isSameOrBefore(currentTime);
  }

  public getJobModel(): JobModel {
    return this.jobModel;
  }

  public getDefinition(): IJobDefinition {
    return this.definition;
  }

  public async saveLog(err?: any): Promise<void> {
    if (this.definition.option.saveLog) {
      await this.context.getJobLogRepository().create<any>({
        jobName: this.jobModel.name,
        jobId: this.jobModel.id,
        jobTime: new Date(),
        job: this.definition as any,
        resultStatus: err ? Status.ERROR : Status.SUCCESS,
        error: err ? (err.message ? err.message : `${err}`) : null,
      });
    }
  }

  public incrementFailCount(): void {
    this.jobModel.failCount = (Number(this.jobModel.failCount || 0) + 1) as any;
  }

  public incrementSuccessCount(): void {
    this.jobModel.successCount = (Number(this.jobModel.successCount || 0) +
      1) as any;
  }

  public removeFromQueue(): void {
    const index = this.context.getJobQueue().indexOf(this);
    if (index > -1) {
      this.context.getJobQueue().splice(index, 1);
    }
  }

  public async save(): Promise<JobModel> {
    return await this.jobModel.save();
  }

  public moveToRunningJobs(): void {
    this.context.getRunningJobs().push(this);
    this.changeJobStatus(JobStatus.RUNNING);
  }

  public handleJobFailure(): void {
    this.changeJobStatus(JobStatus.FAILED);
  }

  public calculateNextTick(): void {
    const expression = this.definition.option.cron!;
    const tz = this.definition.option.timezone;
    const currentDate = this.jobModel.lastTickAt;
    let cronTime = parser.parseExpression(expression, {
      currentDate,
      tz,
    });
    this.jobModel.lastTickAt = this.jobModel.nextTickAt;
    const nextTick = cronTime.next().toDate();
    this.jobModel.nextTickAt = nextTick;
  }

  public finalize(): void {
    const index = this.context.getRunningJobs().indexOf(this);
    if (index > -1) {
      this.context.getRunningJobs().splice(index, 1);
    }
    const indexOfQueue = this.context.getJobQueue().indexOf(this);
    if (indexOfQueue > -1) {
      this.context.getJobQueue().splice(index, 1);
    }
    this.changeJobStatus(JobStatus.FINISHED);
  }

  public changeJobStatus(status: JobStatus): void {
    this.definition.status = status;
    this.context.getJobDefinitions()[
      this.context.getJobDefinitions()[this.jobModel.name].option.name
    ].status = status;
    this.definition.status = status;
    this.jobModel.status = status;
  }

  async run(): Promise<void> {
    await this.definition.option.fn();
  }
}
