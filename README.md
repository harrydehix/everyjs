# everyjs

A small library that allows you to schedule your tasks in a cron job like way.

## Example

```ts
import { every } from "everyjs";

const task = every(5, "second").do((time) => {
    console.log(`Hello world! It is: ${time}`);
});

task.start();
```

## Alignment

By default a task is always _aligned_.
E.g. if you schedule a task to be executed every `n`

-   seconds, it is executed always at the beginning of a second
-   minutes, it is always executed at the beginning of a minute
-   hours, it is always executed at the beginning of an hour
-   weeks, it is always executed at the beginning of a week
-   months, it is always executed at the beginning of a month
-   years, it is always executed at the beginning of a year

You can change the alignment by using the `.align(alignment)` method.

```ts
// This task gets executed every day at 5:30
const task = every(1, "day")
    .do((time) => {
        console.log(`Hello world! It is: ${time}`);
    })
    .align({ hour: 5, minute: 30 });

task.start();
```
