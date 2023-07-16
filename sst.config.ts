import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      stage: "dev", // your local stage name
      name: "remix-sst-esm",
      region: "eu-west-1", // change to your preferred region
      profile: "YOUR_AWS_PROFILE", // change to your preferred AWS profile so you don't deploy to the wrong account
    };
  },
  stacks(app) {
    app.stack(API);
    app.setDefaultRemovalPolicy("destroy"); // Change default for production environment
    app.setDefaultFunctionProps({
      runtime: "nodejs18.x",
    });
  },
} satisfies SSTConfig;
