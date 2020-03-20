import { App } from "@slack/bolt";
import { firestore } from "../lib/firestore";

export const useHistoryCommand = (app: App) => {
  app.command("/history", async ({ ack, body, context, command, say }) => {
    ack();
    const histories = await firestore
      .collection("mokumoku")
      .doc()
      .get();
    say(histories.data()!.toString());
  });
};
