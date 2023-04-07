import { Sequelize } from "sequelize-typescript";
import { Scheduler, Scheduler4JsFrequency } from "../dist";

const connection = new Sequelize({
  port: 3452,
  host: localhost,
  user: postgres,
  password: password,
  dialect: "postgres",
});

const config = {
  frequency: Scheduler4JsFrequency.ONCE_IN_HALF_MINUTE,
  lockLifetime: 6 * 1000,
  type: "x",
  kick: true,
};

const scheduler = new Scheduler({ connection, config });

scheduler.createJob({
  name: "halil",
  concurrency: 1,
  type: "x",
  timezone: "Asia/Dubai",
  cron: "0 */1 * * * *",
  lockExpire: 60 * 1000,
  lockLimit: 1,
  fn: () => {
    console.log("@@@@@@@@@");
  },
});
