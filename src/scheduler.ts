import { DateTime, WeekNumbers } from "luxon";
import { Timeout, clearTimeout, setTimeout } from "long-timeout";

/**
 * A supported time unit.
 */
export type TimeUnit =
    | "second"
    | "minute"
    | "hour"
    | "day"
    | "week"
    | "month"
    | "year";

/**
 * All supported time units as array.
 */
export const TimeUnits: TimeUnit[] = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
];

export function previous(
    interval: Exclude<TimeUnit, "second"> | "alltime"
): TimeUnit {
    switch (interval) {
        case "minute":
            return "second";
        case "hour":
            return "minute";
        case "day":
            return "hour";
        case "week":
            return "day";
        case "month":
            return "week";
        case "year":
            return "month";
        case "alltime":
            return "year";
    }
}

export type TimeInterval = { value: number; unit: TimeUnit };

export type Alignment =
    | false
    | {
          millisecond?: number;
          second?: number;
          minute?: number;
          hour?: number;
          day?: number;
          month?: number;
      };

/**
 * Parses a time interval from a string. Only supports the following format: <number><unit> (e.g. `'5years'`, `'1minute'`, ...)
 * @param interval the time interval's string representation
 * @returns the parsed time interval
 */
export function fromIntervalString(interval: string): TimeInterval {
    interval = interval.trim();

    let number = "";
    let unit = "";
    let mode = 0;
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    for (let i = 0; i < interval.length; i++) {
        const char = interval[i];
        if (mode === 0) {
            if (numbers.includes(char)) {
                number += char;
            } else {
                mode = 1;
                i--;
            }
        } else {
            unit += char;
        }
    }

    unit = unit.trim();

    let parsed_unit: TimeUnit;
    if (["second", "seconds", "s"].includes(unit)) {
        parsed_unit = "second";
    } else if (["minute", "minutes", "min"].includes(unit)) {
        parsed_unit = "minute";
    } else if (["hour", "hours", "h"].includes(unit)) {
        parsed_unit = "hour";
    } else if (["day", "days", "d"].includes(unit)) {
        parsed_unit = "day";
    } else if (["week", "weeks", "w"].includes(unit)) {
        parsed_unit = "week";
    } else if (["month", "months", "m"].includes(unit)) {
        parsed_unit = "month";
    } else if (["year", "years", "year", "a"].includes(unit)) {
        parsed_unit = "year";
    } else {
        throw new Error(`Invalid interval: Unknown time unit '${unit}'!`);
    }

    const parsed_number = Number.parseInt(number.trim());

    return {
        value: parsed_number,
        unit: parsed_unit,
    };
}

export class Schedule {
    interval: number = 1;
    unit: TimeUnit = "second";
    action: (time: DateTime) => void = () => {};
    alignment: Alignment = {
        millisecond: 0,
        second: 0,
        minute: 0,
        hour: 0,
        day: 0,
        month: 0,
    };
    timeout_id?: Timeout;
    running: boolean = false;

    /**
     * Sets the scheduled action.
     * @param action the action to execute repeatedly
     */
    do(action: (time: DateTime) => void) {
        this.action = action;
        return this;
    }

    /**
     * Aligns a task.
     * @example
     * ```ts
     * // This task gets executed every day at 5:30
        const task = every(1, "day")
            .do((time) => {
                console.log(`Hello world! It is: ${time}`);
            })
            .align({ hour: 5, minute: 30 });

        task.start();
     * ```
     * @param alignment 
     * @returns 
     */
    align(alignment: Alignment) {
        if (alignment !== false) {
            if (alignment.month !== undefined) {
                if (alignment.day === undefined) alignment.day = 1;
                if (alignment.hour === undefined) alignment.hour = 0;
                if (alignment.minute === undefined) alignment.minute = 0;
                if (alignment.second === undefined) alignment.second = 0;
                if (alignment.millisecond === undefined)
                    alignment.millisecond = 0;
            } else if (alignment.day !== undefined) {
                if (alignment.hour === undefined) alignment.hour = 0;
                if (alignment.minute === undefined) alignment.minute = 0;
                if (alignment.second === undefined) alignment.second = 0;
                if (alignment.millisecond === undefined)
                    alignment.millisecond = 0;
            } else if (alignment.hour !== undefined) {
                if (alignment.minute === undefined) alignment.minute = 0;
                if (alignment.second === undefined) alignment.second = 0;
                if (alignment.millisecond === undefined)
                    alignment.millisecond = 0;
            } else if (alignment.minute !== undefined) {
                if (alignment.second === undefined) alignment.second = 0;
                if (alignment.millisecond === undefined)
                    alignment.millisecond = 0;
            } else if (alignment.second !== undefined) {
                if (alignment.millisecond === undefined)
                    alignment.millisecond = 0;
            }
        }
        this.alignment = alignment;
        return this;
    }

    constructor(interval: TimeInterval | number, unit: TimeUnit = "second") {
        if (typeof interval === "object") {
            this.interval = interval.value;
            this.unit = interval.unit;
        } else {
            this.interval = interval;
            this.unit = unit;
        }
    }

    /**
     * Gets the next schedule time.
     * @returns
     */
    nextScheduleTime() {
        let nextScheduleTime = DateTime.now();

        let alignment: Alignment = false;
        if (typeof this.alignment === "object") {
            alignment = {
                millisecond:
                    this.alignment.millisecond ?? nextScheduleTime.millisecond,
                second: this.alignment.second ?? nextScheduleTime.second,
                minute: this.alignment.minute ?? nextScheduleTime.minute,
                hour: this.alignment.hour ?? nextScheduleTime.hour,
                month: this.alignment.month ?? nextScheduleTime.month,
            };
        }

        switch (this.unit) {
            case "second":
                if (alignment)
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: alignment.millisecond,
                    });
                nextScheduleTime = nextScheduleTime.plus({
                    seconds: this.interval,
                });
                break;
            case "minute":
                if (alignment)
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: alignment.millisecond,
                        second: alignment.second,
                    });
                nextScheduleTime = nextScheduleTime.plus({
                    minutes: this.interval,
                });
                break;
            case "hour":
                if (alignment)
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: alignment.millisecond,
                        second: alignment.second,
                        minute: alignment.minute,
                    });
                nextScheduleTime = nextScheduleTime.plus({
                    hours: this.interval,
                });
                break;
            case "day":
                if (alignment)
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: alignment.millisecond,
                        second: alignment.second,
                        minute: alignment.minute,
                        hour: alignment.hour,
                    });
                nextScheduleTime = nextScheduleTime.plus({
                    days: this.interval,
                });
                break;
            case "week":
                if (alignment) {
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: alignment.millisecond,
                        second: alignment.second,
                        minute: alignment.minute,
                        hour: alignment.hour,
                        localWeekday: alignment.day as
                            | 1
                            | 2
                            | 3
                            | 4
                            | 5
                            | 6
                            | 7,
                    });
                }
                nextScheduleTime = nextScheduleTime.plus({
                    days: this.interval * 7,
                });
                break;
            case "month":
                if (alignment) {
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: alignment.millisecond,
                        second: alignment.second,
                        minute: alignment.minute,
                        hour: alignment.hour,
                        day: alignment.day,
                    });
                }
                nextScheduleTime = nextScheduleTime.plus({
                    month: this.interval,
                });
                break;
            case "year":
                if (alignment) {
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: alignment.millisecond,
                        second: alignment.second,
                        minute: alignment.minute,
                        hour: alignment.hour,
                        day: alignment.day,
                        month: alignment.month,
                    });
                }
                nextScheduleTime = nextScheduleTime.plus({
                    years: this.interval,
                });
                break;
        }
        return nextScheduleTime;
    }

    /** Starts the schedule. */
    start() {
        this.running = true;

        const nextScheduleTime = this.nextScheduleTime();
        const nextScheduleMilliseconds =
            nextScheduleTime.diffNow().milliseconds;
        this.timeout_id = setTimeout(() => {
            this.action(nextScheduleTime);
            if (this.running) this.start();
        }, nextScheduleMilliseconds);
    }

    /** Stops the schedule. */
    stop() {
        this.running = false;
        if (this.timeout_id) clearTimeout(this.timeout_id);
    }
}

/**
 * Creates a new schedule.
 * @example
 * ```
 * every(23, "second").do(() => {
 *  console.log("Hello world!");
 * }).start();
 * ```
 * @param action
 * @returns
 */
export function every(
    interval: TimeInterval | number,
    unit: TimeUnit = "second"
) {
    return new Schedule(interval, unit);
}
