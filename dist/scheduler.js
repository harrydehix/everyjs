"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schedule = exports.TimeUnits = void 0;
exports.previous = previous;
exports.fromIntervalString = fromIntervalString;
exports.schedule = schedule;
const luxon_1 = require("luxon");
const long_timeout_1 = require("long-timeout");
exports.TimeUnits = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
];
function previous(interval) {
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
function fromIntervalString(interval) {
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
            }
            else {
                mode = 1;
                i--;
            }
        }
        else {
            unit += char;
        }
    }
    unit = unit.trim();
    let parsed_unit;
    if (["second", "seconds", "s"].includes(unit)) {
        parsed_unit = "second";
    }
    else if (["minute", "minutes", "min"].includes(unit)) {
        parsed_unit = "minute";
    }
    else if (["hour", "hours", "h"].includes(unit)) {
        parsed_unit = "hour";
    }
    else if (["day", "days", "d"].includes(unit)) {
        parsed_unit = "day";
    }
    else if (["week", "weeks", "w"].includes(unit)) {
        parsed_unit = "week";
    }
    else if (["month", "months", "m"].includes(unit)) {
        parsed_unit = "month";
    }
    else if (["year", "years", "year", "a"].includes(unit)) {
        parsed_unit = "year";
    }
    else {
        throw new Error(`Invalid interval: Unknown time unit '${unit}'!`);
    }
    const parsed_number = Number.parseInt(number.trim());
    return {
        value: parsed_number,
        unit: parsed_unit,
    };
}
class Schedule {
    interval = 1;
    unit = "second";
    action;
    align;
    timeout_id;
    running = false;
    constructor(action, options = { align: true }) {
        this.action = action;
        this.align = options.align ?? true;
    }
    every(interval, unit = "second") {
        if (typeof interval === "object") {
            this.interval = interval.value;
            this.unit = interval.unit;
        }
        else {
            this.interval = interval;
            this.unit = unit;
        }
        return this;
    }
    nextScheduleTime() {
        let nextScheduleTime = luxon_1.DateTime.now();
        switch (this.unit) {
            case "second":
                if (this.align)
                    nextScheduleTime = nextScheduleTime.set({ millisecond: 0 });
                nextScheduleTime = nextScheduleTime.plus({
                    seconds: this.interval,
                });
                break;
            case "minute":
                if (this.align)
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: 0,
                        second: 0,
                    });
                nextScheduleTime = nextScheduleTime.plus({
                    minutes: this.interval,
                });
                break;
            case "hour":
                if (this.align)
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: 0,
                        second: 0,
                        minute: 0,
                    });
                nextScheduleTime = nextScheduleTime.plus({
                    hours: this.interval,
                });
                break;
            case "day":
                if (this.align)
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: 0,
                        second: 0,
                        minute: 0,
                        hour: 0,
                    });
                nextScheduleTime = nextScheduleTime.plus({
                    days: this.interval,
                });
                break;
            case "week":
                if (this.align) {
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: 0,
                        second: 0,
                        minute: 0,
                        hour: 0,
                        localWeekday: 1,
                    });
                }
                nextScheduleTime = nextScheduleTime.plus({
                    days: this.interval * 7,
                });
                break;
            case "month":
                if (this.align) {
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: 0,
                        second: 0,
                        minute: 0,
                        hour: 0,
                        day: 1,
                    });
                }
                nextScheduleTime = nextScheduleTime.plus({
                    month: this.interval,
                });
                break;
            case "year":
                if (this.align) {
                    nextScheduleTime = nextScheduleTime.set({
                        millisecond: 0,
                        second: 0,
                        minute: 0,
                        hour: 0,
                        day: 1,
                        month: 1,
                    });
                }
                nextScheduleTime = nextScheduleTime.plus({
                    years: this.interval,
                });
                break;
        }
        return nextScheduleTime;
    }
    start() {
        this.running = true;
        const nextScheduleTime = this.nextScheduleTime();
        const nextScheduleMilliseconds = nextScheduleTime.diffNow().milliseconds;
        this.timeout_id = (0, long_timeout_1.setTimeout)(() => {
            this.action(nextScheduleTime);
            if (this.running)
                this.start();
        }, nextScheduleMilliseconds);
    }
    stop() {
        this.running = false;
        if (this.timeout_id)
            (0, long_timeout_1.clearTimeout)(this.timeout_id);
    }
}
exports.Schedule = Schedule;
function schedule(action) {
    return new Schedule(action);
}
