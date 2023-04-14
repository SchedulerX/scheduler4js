const { Scheduler, Frequency, Timezone, CronUtil } = require("../dist/index");

async function example() {
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
    frequency: Frequency.ONCE_IN_HALF_MINUTE,
    lockLifetime: 6 * 1000,
    type: "x",
    kick: true,
  };

  const scheduler = new Scheduler();
  await scheduler.init({ dbConfig, config });

  scheduler.enqueueJob({
    name: "halil",
    concurrency: 1,
    type: "x",
    timezone: Timezone.ASIA_DUBAI,
    cron: CronUtil.EVERY_X_MINUTE(1),
    lockLimit: 1,
    saveLog: false,
    priority: 0,
    fn: () => {
      console.log(`Job run at the time of ${new Date()}`);
    },
  });

  scheduler.on("begin", (job) => {
    console.log("begin", job);
  });

  scheduler.on("completed", (job) => {
    console.log("completed", job);
  });

  scheduler.on("fail", (err, job) => {
    console.log("fail", err, job);
  });
}

example();
