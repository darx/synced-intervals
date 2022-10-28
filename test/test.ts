declare var process: any;

import Queue from "../src/index";

const test = new Queue([
  {
    id: "test1",
    handler: () => {
      return new Promise((resolve) => {
        resolve(true);
        console.log("test 1");
      });
    },
    interval: 5,
    immediate: true,
  }
]);

// test.add = {
//   id: "test1",
//   handler: () => {
//     return new Promise((resolve) => {
//       resolve(true);
//       console.log("test 1");
//     });
//   },
//   interval: 5,
//   immediate: true,
// };

setTimeout(() => {
  test.remove("test1");
}, 60000);
