/**
 * Author: Halil Baydar
 */

import { Frequency } from "../enums/frequency";

// Define an interface called SchedulerConfig
export interface SchedulerConfig {
  // Define a property called frequency that is of type Frequency
  frequency?: Frequency;

  // Define a property called lockLifetime that is a number
  lockLifetime?: number;

  // Define a property called type that is a string
  type?: string;

  // Define a property called kick that is a boolean
  kick?: boolean;
}
