import { Sequelize } from "sequelize";
export type Dialect =
  | "mysql"
  | "postgres"
  | "sqlite"
  | "mariadb"
  | "mssql"
  | "db2"
  | "snowflake";

export interface DbConfig {
  dbName: string;
  host: string;
  port: number;
  user: string;
  password: string;
  dialect?: Dialect;
}

export interface IDatabase<T> {
  initTable(t: T): Promise<T>;
  connect(options: DbConfig): Promise<Sequelize>;
}
