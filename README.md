# synced-intervals

### Usage

```js
import Intervals from "synced-intervals";

const Processes = new Intervals([
  {
    id: "test1",
    handler: () => {
      // ... code ...
    },
    interval: 5,
    immediate: true,
    insight: true
  },
]);

// view current processes being run
Processes.on("pending", (data) => console.log("pending", data));
```

#### Getting started with development
```bash
git clone https://github.com/darx/synced-intervals.git
cd synced-intervals
npm ci
npm test
```

#### Environmental variables
```bash
(echo TEST_FETCH_LINK=) > .env
```
