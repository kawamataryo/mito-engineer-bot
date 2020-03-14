import { App } from "@slack/bolt";

export const usePingCommand = (app: App) => {
  app.command("/ping", async ({ ack, say }) => {
    ack();
    say("pong");
  });
};
