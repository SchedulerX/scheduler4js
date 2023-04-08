import { WEEK_DAYS } from "../enums/week.days";
import { Time } from "../types/time";

export class CronUtil {
  public static EVERY_X_SECOND(sec: number): string {
    if (sec <= 0) throw new Error("min cannot lte to 0");
    return `*/${sec} * * * * *`;
  }

  public static EVERY_X_MINUTE(min: number): string {
    if (min <= 0) throw new Error("min cannot lte to 0");
    return `0 */${min} * * * *`;
  }

  public static EVERY_X_HOUR(hour: number): string {
    if (hour <= 0 || hour > 12) throw new Error("min cannot lte to 0 or gt 12");
    return `0 0-23/${hour} * * *`;
  }

  public static EVERY_WEEKEND_AT(time: Time): string {
    CronUtil.checkTime(time);
    return `0 ${time.minute} ${time.hour} * * 6,0`;
  }

  public static MONDAY_TO_FRIDAY_AT(time: Time): string {
    CronUtil.checkTime(time);
    return `0 ${time.minute} ${time.hour} * * 1-5`;
  }

  public static EVERY_FIRST_DAY_OF_MONTH_AT(time: Time): string {
    CronUtil.checkTime(time);
    return `${time.minute} ${time.hour} 1 * *`;
  }

  public static EVERY_DAY_AT(time: Time): string {
    CronUtil.checkTime(time);
    return `${time.minute} ${time.hour} * * *`;
  }

  public static EVERY_WEEK_AT(time: Time, day: WEEK_DAYS): string {
    CronUtil.checkTime(time);
    return `${time.minute} ${time.hour} * * ${day}`;
  }

  public static checkTime(time: Time): void {
    if (time.minute < 0 || time.minute > 60) {
      throw new Error("Minute cannot be bigger than 60 or less than 0");
    }
    if (time.hour < 0 || time.hour > 24) {
      throw new Error("Clock cannot be bigger than 24 or less than 0");
    }
  }
}
