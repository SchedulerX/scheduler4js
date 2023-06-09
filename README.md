### Scheduler4js

Scheduler4js is a library for scheduling tasks in Node.JS.
This library makes easier to dynamically create cron jobs running on sql database from client side.

| Feature                    |   scheduler4js   |
| :------------------------- | :--------------: |
| Backend                    | Postgresql/Mssql |
| Priorities                 |        ✓         |
| Concurrency                |        ✓         |
| Global events              |        ✓         |
| Atomic ops                 |        ✓         |
| Persistence                |        ✓         |
| Supports long running jobs |        ✓         |
| Supports logging           |        ✓         |
| Supports group jobs        |        ✓         |
| Optimized for              |       Jobs       |

### Installation

```
npm i scheduler4js
```

### Usage:

This library provides a schedule class that accepts a task function and a config representing when the task should be run.

#### Create db connection and library config to create instance of the library:

### TS

```js
import { Scheduler, Frequency, Timezone, CronUtil } from "scheduler4js";
```

### JS

```js
const { Scheduler, Frequency, Timezone, CronUtil } = require("scheduler4js");
```

```js
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

  const scheduler = await Scheduler.init({ dbConfig, config });

  scheduler.enqueueJob({
    name: "example",
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
```

### API

Schedules a task to repeat at the specified date.

- name: The name of the job
- concurrency: The concurrency of the job
- type: The type of the job which shows which executor should execute the given job
- lockLimit: It shows the number of lock limit
- fn: A function to run when the scheduled time arrives.
- cron: It's cron expression representing the time to run the task again and again.
- saveLog: It saves the result of the given jobs when they run
- priority: Reorder jobs according to the given priority
- frequency: It specifies the frequency which master cron job repeats in a minute
- lockLifetime: It shows the lock life time of the jobs in ms
- kick: To kick jobs to run

### License

### MIT
