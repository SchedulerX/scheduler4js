/*
  An amount of ms in second
*/
const SECOND = 1000;

/*
  * Scheduler master frequency which scans all pre-defined jobs to run
  * If your tasks run rarely like once an hour, you should decrease frequency/increase period 
    like from ONCE_IN_SECOND to ONCE_IN_TWO_MINUTE. Otherwise this library makes io operations a lot
  * An amount of milliseconds to wait to run the given jobs.
*/
export enum Frequency {
  /*
  Scans all jobs once a second
  */
  ONCE_IN_SECOND = SECOND,
  /*
  Scans all jobs once quarter of a minute
  */
  ONCE_IN_QUARTER_MINUTE = 15 * SECOND,
  /*
  Scans all jobs once half of a minute
  */
  ONCE_IN_HALF_MINUTE = 30 * SECOND,
  /*
  Scans all jobs once a minute
  */
  ONCE_IN_MINUTE = 60 * SECOND,
  /*
  Scans all jobs once two minute
  */
  ONCE_IN_TWO_MINUTE = 120 * SECOND,
}
