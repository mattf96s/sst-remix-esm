# sst-remix-esm

A barebones ESM example of a [Remix](https://remix.run/) project running deployed with AWS Lambda through the [SST framework](https://docs.sst.dev/constructs/RemixSite).

It uses PNPM's patch capabilities to convert SST's deployment config from CJS to ESM. The [express server](packages/my-remix-app/server.js) is also used rather than the default Remix server. 

## Instructions

First go to [sst.config.ts](sst.config.ts) and set your AWS region and AWS profile (or even better, follow these setup [instructions](https://docs.sst.dev/setting-up-aws)).

Install dependencies.
```
pnpm install
```

Start the SST server.
```
pnpm dev
```

Start the remix app by opening a new terminal tab.
```
pnpm my-remix-app
```
Or instead of the above command, still within a new terminal, `cd packages/my-remix-app` and then run `pnpm dev`.
