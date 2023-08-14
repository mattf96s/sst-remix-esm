import { StackContext, RemixSite } from "sst/constructs";

export function API({ stack }: StackContext) {
  const site = new RemixSite(stack, "Site", {
    path: "packages/my-remix-app/",
    runtime: "nodejs18.x",
    edge: false,
    nodejs: {
      format: "esm",
    },
  });

  stack.addOutputs({
    SITE_URL: site.url,
  });
}
