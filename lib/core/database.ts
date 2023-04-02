import { Sequelize, SequelizeStatic } from "sequelize";
import { FindOptions, UpdateOptions, CreateOptions } from "sequelize";
import { DbConfig, IDatabase } from "../types/database";
import { ISchedulerRepository } from "../types/repository";

export class Database<T> implements IDatabase<T> {}
