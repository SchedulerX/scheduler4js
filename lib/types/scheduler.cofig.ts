import { Scheduler4JsFrequency } from "../enums/frequency";

export interface SchedulerConfig {
  frequency: Scheduler4JsFrequency;
  lockLifetime: number;
  type: string;
}
