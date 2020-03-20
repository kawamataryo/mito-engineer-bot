import { App } from "@slack/bolt";
import { firestore } from "../../lib/firestore";
import dayjs from "dayjs";
import "dayjs/locale/ja";
dayjs.locale("ja");

const createMessageBlock = (date: string, todos: string[]) => {
  return [
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `:memo: ${date}のもくもく内容`
        }
      ]
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: todos.join("\n")
      }
    },
    {
      type: "divider"
    }
  ];
};

export const useHistoryCommand = (app: App) => {
  app.command("/history", async ({ ack, body, context, command, say }) => {
    ack();
    // validate command arg
    if (command.text.length === 0) {
      say(
        "引数にデータを取得したい日付を入力して下さい（例 `/history 2019-02-14`）"
      );
      return;
    }

    const targetDay = dayjs(command.text).format("YYYY-MM-DD");
    const result = await firestore
      .collection("mokumoku")
      .where("date", "==", targetDay)
      .get();

    if (result.size === 0) {
      say("データが見つかりません");
      return;
    }

    const todos: string[] = [];
    result.forEach(doc => {
      todos.push("```\n" + doc.data().todo + "\n```");
    });

    await app.client.chat.postMessage({
      token: context.botToken,
      channel: command.channel_id,
      text: "",
      blocks: createMessageBlock(targetDay, todos)
    });
  });
};
