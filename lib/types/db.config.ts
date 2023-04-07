import { Dialect } from "sequelize";

export interface DbConfig {
  dbName: string;
  host: string;
  port: number;
  user: string;
  password: string;
  dialect?: Dialect;
}
