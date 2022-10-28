import "dotenv/config";

declare var process: any;

import Queue from "../src/index";

import request from "./utils/request";

const test = new Queue([
  {
    id: "test1",
    handler: () => {
      return new Promise((resolve, reject) => {
        request({
          url: process.env.TEST_FETCH_LINK
        })
        .catch((err: void) => reject(err))
        .then((data: void) => resolve(data));
      });
    },
    interval: 5,
    immediate: true,
    insight: true
  },
  {
    id: "test2",
    handler: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
          console.log("test 2");
        }, 3000);
      });
    }
  },
  {
    id: "test2",
    handler: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
          console.log("test 2");
        }, 3000);
      });
    }
  },
]);

test.on("status", (data: any) => {
  console.log("status", data);
})

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

// setTimeout(() => {
//   test.remove("test1");
// }, 60000);
