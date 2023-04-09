import { Frequency } from "../enums/frequency";

export interface SchedulerConfig {
  frequency: Frequency;
  lockLifetime: number;
  type: string;
  kick: boolean;
}
