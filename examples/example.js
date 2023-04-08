const { Scheduler, Scheduler4JsFrequency } = require("scheduler4js");

const dbConfig = {
  port: 5432,
  host: "localhost",
  username: "postgres",
  password: "password",
  dialect: "postgres",
  database: "scheduler4js",
  logging: false,
};

const config = {
  frequency: Scheduler4JsFrequency.ONCE_IN_HALF_MINUTE,
  lockLifetime: 6 * 1000,
  type: "x",
  kick: true,
};

const scheduler = new Scheduler({ dbConfig, config });

scheduler.createJob({
  name: "halil",
  concurrency: 1,
  type: "x",
  timezone: "Asia/Dubai",
  cron: "0 */1 * * * *",
  lockExpire: 60 * 1000,
  lockLimit: 1,
  fn: () => {
    console.log(`Job run at the time of ${new Date()}`);
  },
});
