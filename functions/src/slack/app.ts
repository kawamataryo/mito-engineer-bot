import * as functions from "firebase-functions";
import { App, ExpressReceiver } from "@slack/bolt";
import { useMokumokuCommand } from "./commands/mokumoku";
import { usePingCommand } from "./commands/ping";
import { useHistoryCommand } from "./commands/history";

const config = functions.config();

export const expressReceiver = new ExpressReceiver({
  signingSecret: config.slack.secret,
  endpoints: "/events",
  processBeforeResponse: true
});

const app = new App({
  receiver: expressReceiver,
  token: config.slack.token,
  processBeforeResponse: true
});

usePingCommand(app);
useMokumokuCommand(app);
useHistoryCommand(app);
