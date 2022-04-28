const fs = require('fs')
let raw = fs.readFileSync('./src/data/db.json');
const { App } = require("@slack/bolt");
require("dotenv").config();

// ----------------
// Initializing
// ----------------
let faqs= JSON.parse(raw);


const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// ----------------
// Routing Messages
// ----------------

app.message(/hey/, require('./message_handlers/hey_message_handler'));

// ----------------
// Routing Commands
// ----------------

app.command("/room", require('./commands/room_command'));

app.command("/knowledge", async ({ command, ack, say }) => {
    try {
      await ack();
      let message = { blocks: [] };
      faqs.data.map((faq) => {
        message.blocks.push(
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Question*",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: faq.question,
            },
          },
          {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Answer*",
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: faq.answer,
              },
            }
        );
      });
      say(message);
    } catch (error) {
      console.log("err");
      console.error(error);
    }
  });

  app.command("/update", async ({ command, ack, say }) => {
    try {
      await ack();
      const data = command.text.split("|");
      const newFAQ = {
        keyword: data[0].trim(),
        question: data[1].trim(),
        answer: data[2].trim(),
      };
      // save data to db.json
      fs.readFile("./src/data/db.json", function (err, data) {
        const json = JSON.parse(data);
        json.data.push(newFAQ);
        fs.writeFile("./src/data/db.json", JSON.stringify(json), function (err) {
          if (err) throw err;
          console.log("Successfully saved to db.json!");
        });
      });
      say(`You've added a new FAQ with the keyword *${newFAQ.keyword}.*`);
    } catch (error) {
      console.log("err");
      console.error(error); 
    }
  });

// ----------------
// Main Server
// ----------------

(async () => {
  const port = process.env.PORT
  // Start your app 
  await app.start(port || 3000);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
