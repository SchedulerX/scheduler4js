export enum CronExpression {
  EVERY_SECOND = "* * * * * *",
  EVERY_WEEK = "0 0 * * 0",
  EVERY_2ND_HOUR = "0 */2 * * *",
  EVERY_2ND_HOUR_FROM_1AM_THROUGH_11PM = "0 1-23/2 * * *",
  EVERY_2ND_MONTH = "0 0 1 */2 *",
  EVERY_QUARTER = "0 0 1 */3 *",
  EVERY_6_MONTHS = "0 0 1 */6 *",
  EVERY_30_MINUTES_BETWEEN_9AM_AND_5PM = "0 */30 9-17 * * *",
  EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM = "0 */30 9-18 * * *",
  EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM = "0 */30 10-19 * * *",
}
