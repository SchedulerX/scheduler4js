import { Dialect, PoolOptions } from "sequelize";

export interface DbConfig {
  database: string;
  host: string;
  port: number;
  username: string;
  password: string;
  dialect?: Dialect;
  pool?: PoolOptions;
}
