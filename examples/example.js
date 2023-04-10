const { Scheduler, Frequency, Timezone, CronUtil } = require("scheduler4js");

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
  await scheduler.init({ dbConfig: dbConfig, config });

  scheduler.enqueueJob({
    name: "halil",
    concurrency: 1,
    type: "x",
    timezone: Timezone.ASIA_DUBAI,
    cron: CronUtil.EVERY_X_MINUTE(1),
    lockExpire: 60 * 1000,
    lockLimit: 1,
    fn: () => {
      console.log(`Job run at the time of ${new Date()}`);
    },
    saveLog: false,
    priority: 0,
  });
}

example();
