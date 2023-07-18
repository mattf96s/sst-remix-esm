import * as fs from "node:fs";

import type {
  GetLoadContextFunction,
  RequestHandler,
} from "@remix-run/express";
import { createRequestHandler } from "@remix-run/express";
import type { ServerBuild } from "@remix-run/node";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import chokidar from "chokidar";
import compression from "compression";
import express from "express";
import morgan from "morgan";

installGlobals();

const BUILD_PATH = "./build/index.js";
/**
 * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
 */
const build = await import(BUILD_PATH);

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

morgan.token("url", (req, res) => decodeURIComponent(req.url ?? ""));
app.use(morgan("tiny"));

const getLoadContextFn: GetLoadContextFunction = async (req, res) => {
  // can do dependency injection: https://sergiodxa.com/articles/dependency-injection-in-remix-loaders-and-actions
  // or add a nonce: https://github.com/epicweb-dev/epic-stack/blob/main/server/index.ts#:~:text=123
  return {};
};

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? createDevRequestHandler(build)
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
        getLoadContext: getLoadContextFn,
      })
);

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
});

/**
 * @param {ServerBuild} initialBuild
 */
function createDevRequestHandler(initialBuild: ServerBuild): RequestHandler {
  let build = initialBuild;
  async function handleServerUpdate() {
    // 1. re-import the server build
    build = await reimportServer();
    // 2. tell dev server that this app server is now up-to-date and ready
    broadcastDevReady(build);
  }

  chokidar
    .watch(BUILD_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: "development",
        getLoadContext: getLoadContextFn,
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// ESM import cache busting
/**
 * @type {() => Promise<ServerBuild>}
 */
async function reimportServer() {
  const stat = fs.statSync(BUILD_PATH);

  // use a timestamp query parameter to bust the import cache
  return import(BUILD_PATH + "?t=" + stat.mtimeMs);
}
