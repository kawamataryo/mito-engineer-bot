import { App } from "@slack/bolt";
import { firestore } from "../../lib/firestore";
import { localeNow } from "../../lib/localdate";

const VIEW_ID = "dialog_1";

type User = {
  real_name: string;
  profile: {
    image_192: string;
  };
};

const createMessageBlock = (
  username: string,
  userIcon: string,
  profile: string,
  todo: string
) => {
  return [
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `posted by *${username}*`
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
        text: `:memo: *自己紹介*\n${profile}\n\n\n:books: *今日やること*\n${todo}`
      },
      accessory: {
        type: "image",
        image_url: userIcon,
        alt_text: "user thumbnail"
      }
    },
    {
      type: "divider"
    }
  ];
};

export const useMokumokuCommand = (app: App) => {
  app.command("/moku", async ({ ack, body, context, command }) => {
    ack();
    let prevProfile = "";
    try {
      // get prev profile
      const result = await firestore
        .collection("mokumoku")
        .where("user", "==", command.user_id)
        .get();
      if (!result.empty) {
        prevProfile = result.docs[0].data().profile;
      }

      await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          callback_id: VIEW_ID,
          title: {
            type: "plain_text",
            text: "今日のもくもく"
          },
          blocks: [
            {
              type: "input",
              block_id: "profile_block",
              label: {
                type: "plain_text",
                text: "自己紹介"
              },
              element: {
                type: "plain_text_input",
                action_id: "profile_input",
                multiline: true,
                initial_value: prevProfile
              }
            },
            {
              type: "input",
              block_id: "todo_block",
              label: {
                type: "plain_text",
                text: "今日やること"
              },
              element: {
                type: "plain_text_input",
                action_id: "todo_input",
                multiline: true
              }
            }
          ],
          private_metadata: command.channel_id,
          submit: {
            type: "plain_text",
            text: "投稿"
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  app.view(VIEW_ID, async ({ ack, view, context, body }) => {
    ack();
    const values = view.state.values;
    const channelId = view.private_metadata;
    const profile = values.profile_block.profile_input.value;
    const todo = values.todo_block.todo_input.value;

    try {
      // get user info
      const { user } = await app.client.users.info({
        token: context.botToken,
        user: body.user.id
      });
      // post chanel
      await app.client.chat.postMessage({
        token: context.botToken,
        channel: channelId,
        text: "",
        blocks: createMessageBlock(
          (user as User).real_name,
          (user as User).profile.image_192,
          profile,
          todo
        )
      });
      // save data
      await firestore.collection("mokumoku").add({
        user: body.user.id,
        user_name: (user as User).real_name,
        date: localeNow().format("YYYY-MM-DD"),
        profile,
        todo
      });
    } catch (error) {
      console.error("post message error", error);
    }
  });
};
