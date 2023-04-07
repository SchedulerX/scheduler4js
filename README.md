### Scheduler4js

Scheduler4js is a lightweight library for scheduling tasks in Node.js.
This library makes easier to create cron jobs, running on sql database, dynamically from client side.

### Installation

```
npm i scheduler4js
```

### Usage:

The library provides a schedule class that accepts a task function and a config representing when the task should be run.

#### Create db connection and library config to create instance of the library:

```
import { Sequelize } from "sequelize-typescript";
import { Scheduler, Scheduler4JsFrequency } from "../dist";

const dbConfig = {
  port: 3452,
  host: localhost,
  user: postgres,
  password: password,
  dialect: "postgres",
};

const config = {
  frequency: Scheduler4JsFrequency.ONCE_IN_HALF_MINUTE,
  lockLifetime: 6 * 1000,
  type: "x",
  kick: true,
};

const scheduler = new Scheduler({ dbConfig, config });
```

### Create a job:

```
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
```

### API

Schedules a task to repeat at the specified date.

- name: The name of the job
- concurrency: The concurrency of the job
- type: The type of the job which shows which executor should execute the given job
- lockExpire: It shows locking life time of the given job
- lockLimit: IT shows the number of lock limit
- fn - A function to run when the scheduled time arrives.
- cron - It's cron expression representing the time to run the task again and again.

### License

### ISC
