import { DataTypes } from "sequelize";
import { Options } from "sequelize/types";
import { JobModel } from "../models/model.job";
import { JobLogModel } from "../models/model.job.log";
import { ParentModel } from "../models/parent.model";
import { IDatabase } from "../types/database";
import { Sequelize } from "sequelize-typescript";

export class Database<K extends {}, T extends ParentModel<T, K>>
  implements IDatabase
{
  initJobTable(sequelize: Sequelize): typeof JobModel {
    return JobModel.init(
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
        },
        nextRunAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        lockedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        priority: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        cron: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        timezone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        failCount: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        successCount: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
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
  }
  initJobLogTable(sequelize: Sequelize): typeof JobLogModel {
    return JobLogModel.init(
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
  }
  connect(options: Options): Sequelize {
    return new Sequelize(options);
  }
}
