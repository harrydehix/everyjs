"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
(0, index_1.every)(1, "minute")
    .do((time) => {
    console.log(`Hello, it is ${time}!`);
})
    .align({
    second: 10,
})
    .start();
