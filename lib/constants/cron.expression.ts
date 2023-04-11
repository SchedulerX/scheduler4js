/**
 * Author: Halil Baydar
 */

export enum CronExpression {
  EVERY_SECOND = "* * * * * *",
  EVERY_WEEK = "0 0 * * 0",
  EVERY_QUARTER = "0 0 1 */3 *",
}
