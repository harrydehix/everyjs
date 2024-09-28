import { every } from "./index";

every(1, "minute")
    .do((time) => {
        console.log(`Hello, it is ${time}!`);
    })
    .align({
        second: 10,
    })
    .start();
