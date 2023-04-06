import { DataTypes, Model } from "sequelize";
import { Options } from "sequelize/types";
import { JobModel } from "../models/model.job";
import { JobLogModel } from "../models/model.job.log";
import { ParentModel } from "../models/parent.model";
import { IDatabase } from "../types/database";
import { Sequelize } from "sequelize-typescript";
import { JobStatus } from "../enums/job.status";
import { DEFAULT_JOB_TYPE } from "../constants/job.constants";

export class Database implements IDatabase {
  private jobTable: typeof JobModel | undefined;
  private jobLogTable: typeof JobLogModel | undefined;
  initJobTable(sequelize: Sequelize): typeof JobModel {
    if (this.jobTable) return this.jobTable;
    this.jobTable = JobModel.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
        },
        context: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        disabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        nextTickAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        lockedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        priority: {
          type: DataTypes.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
        cron: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        timezone: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "gtm0",
        },
        failCount: {
          type: DataTypes.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
        successCount: {
          type: DataTypes.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: JobStatus.RUNNING,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: DEFAULT_JOB_TYPE,
        },
      },
      {
        underscored: true,
        sequelize,
        tableName: "jobs",
        schema: "public",
        timestamps: true,
        indexes: [
          {
            name: "job_pkey",
            unique: true,
            fields: [{ name: "id" }],
          },
          {
            name: "job_name",
            unique: true,
            fields: [{ name: "name" }],
          },
        ],
      }
    );
    return this.jobTable;
  }
  initJobLogTable(sequelize: Sequelize): typeof JobLogModel {
    if (this.jobLogTable) return this.jobLogTable;
    this.jobLogTable = JobLogModel.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
        },
        jobName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        jobId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: { model: "jobs", key: "id" },
        },
        jobTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        job: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        resultStatus: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        underscored: true,
        sequelize,
        tableName: "job_log",
        schema: "public",
        timestamps: true,
        indexes: [
          {
            name: "job_log_pkey",
            unique: true,
            fields: [{ name: "id" }],
          },
        ],
      }
    );
    return this.jobLogTable;
  }
  connect(options: Options): Sequelize {
    return new Sequelize(options);
  }
  public getJob(): typeof JobModel | undefined {
    return this.jobTable;
  }
  public getJobLog(): typeof JobLogModel | undefined {
    return this.jobLogTable;
  }
}
