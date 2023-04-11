### Scheduler4js

Scheduler4js is a library for scheduling tasks in Node.JS.
This library makes easier to dynamically create cron jobs running on sql database from client side.

### Installation

```
npm i scheduler4js
```

### Usage:

The library provides a schedule class that accepts a task function and a config representing when the task should be run.

#### Create db connection and library config to create instance of the library:

### TS IMPORT

```
import { Scheduler, Frequency, Timezone, CronUtil } from 'scheduler4js';
```

### JS IMPORT

```
const { Scheduler, Frequency, Timezone, CronUtil } = require("scheduler4js");
```

```
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
    fn: () => {
      console.log(`Job run at the time of ${new Date()}`);
    },
    saveLog: false,
    priority: 0,
  });
}

example();

```

### Output:

```
Job run at the time of Sat Apr 08 2023 08:01:05 GMT+0300 (GMT+03:00)
Job run at the time of Sat Apr 08 2023 08:02:05 GMT+0300 (GMT+03:00)
Job run at the time of Sat Apr 08 2023 08:03:05 GMT+0300 (GMT+03:00)
Job run at the time of Sat Apr 08 2023 08:04:05 GMT+0300 (GMT+03:00)
Job run at the time of Sat Apr 08 2023 08:05:05 GMT+0300 (GMT+03:00)
```

### API

Schedules a task to repeat at the specified date.

- name: The name of the job
- concurrency: The concurrency of the job
- type: The type of the job which shows which executor should execute the given job
- lockExpire: It shows locking life time of the given job
- lockLimit: It shows the number of lock limit
- fn: A function to run when the scheduled time arrives.
- cron: It's cron expression representing the time to run the task again and again.
- saveLog: It saves the result of the given jobs when they run
- priority: Reorder jobs according to the given priority

### License

### MIT
