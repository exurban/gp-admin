#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const HelloCdkStack = require("../lib/hello-cdk-stack");

// import { App } from "@aws-cdk/core";
// import HelloCdkStack from "../lib/hello-cdk-stack";

const app = new cdk.App();
new HelloCdkStack(app, "HelloCdkStack");
