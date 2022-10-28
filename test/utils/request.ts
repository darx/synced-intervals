import * as http from "http";
import * as https from "https";

const contains = (arr: Array<string>, string: string): boolean =>
  arr.some(x => string.toLowerCase() === x.toLowerCase());

const request = (payload: any) => {
  const { url, headers, method, body } = payload;
  const data = !body ? "" : JSON.stringify(body);

  let { hostname, pathname: path, search, protocol, port } = new URL(url);

  if (search) path = path + search;

  const options : any = {
    method: method || "GET",
    hostname,
    path,
    headers: headers || {}
  };

  if (
    contains(["POST", "PATCH", "PUT", "DELETE"], options.method) &&
    contains(Object.values(options.headers), "application/json") &&
    !contains(Object.keys(options.headers), "Content-Length")
  ) {
    options.headers["Content-Length"] = data.length;
  }

  if (protocol === "http:") {
    options.port = 80;
  }

  if (port && options.port !== port) {
    options.port = Number(port);
  }

  return new Promise((resolve, reject) => {
    const req = (!options.port ? https : http).request(options, res => {
      if (typeof res.statusCode === "number" && [301, 302].includes(res.statusCode)) {
        return resolve(request({ ...payload, url: res.headers.location }));
      }

      let data = "";

      res.on("data", chunk => (data += chunk));

      res.on("end", () => {
        try {
          let response = JSON.parse(data);
          return resolve(response);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on("error", e => reject(e));

    if (contains(Object.keys(options.headers), "Content-Length")) {
      req.write(data);
    }

    req.end();
  });
};

export default request;