const { google } = require("googleapis");
require("dotenv").config();

// Provide the required configuration
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Google calendar API settings
const SCOPES = "https://www.googleapis.com/auth/calendar";
const calendar = google.calendar({ version: "v3" });

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES
);

// Get all the events between two dates
const getEvents = async (dateTimeStart, dateTimeEnd) => {
  try {
    let response = await calendar.events.list({
      auth: auth,
      calendarId: calendarId,
      timeMin: dateTimeStart,
      timeMax: dateTimeEnd,
      timeZone: "Europe/Stockholm",
    });

    let items = response["data"]["items"];
    return items;
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return 0;
  }
};

// let start = "2022-03-03T00:00:00.000Z";
// let end = "2022-05-04T00:00:00.000Z";

// getEvents(start, end)
//   .then((res) => {
//     filtering(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const filtering = (res) => {
  let result = [];
  const hoursOffset = 1;
  const room1 = "shared.meeting.room1@gmail.com";
  var todayDateMonth = new Date().getDate();
  var todayDateHour = new Date().getHours();
  console.log("todayDateHour", todayDateHour);
  res.forEach((element) => {
    const d = new Date(element.start.dateTime);
    const hour = d.getUTCHours() + 2;
    const day = d.getDate();
    // console.log(d.getUTCMinutes());
    if (
      element.attendees &&
      element.attendees[0].email !== "shared.meeting.room1@gmail.com" &&
      day === todayDateMonth &&
      hour >= todayDateHour &&
      hour <= todayDateHour + hoursOffset
    ) {
      if (!result.includes(room1)) {
        result.push(room1);
      }
      console.log("you can get this room now->", result);
    } else if (
      !element.attendees &&
      day === todayDateMonth &&
      hour >= todayDateHour &&
      hour <= todayDateHour + hoursOffset
    ) {
      console.log("no attendees");
      if (!result.includes(room1)) {
        result.push(room1);
      }
      console.log("You can get this room now->", result);
    } else {
      if (!result) {
        console.log("there is no free room now!");
      }
    }
  });
};

module.exports = async ({ command, ack, say }) => {
  try {
    let start = "2022-03-03T00:00:00.000Z";
    let end = "2022-05-04T00:00:00.000Z";
    await ack();
    say(
      getEvents(start, end).then((res) => {
        filtering(res);
      })
    );
  } catch (error) {
    console.log(`Error in processing /room command: ${error}`);
  }
};
