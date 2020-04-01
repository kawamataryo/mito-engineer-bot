import { App } from "@slack/bolt";

export const usePingCommand = (app: App) => {
  app.command("/ping", async ({ ack, say }) => {
    await ack();
    await say("pong");
  });
};
