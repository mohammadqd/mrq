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
module.exports.getEvents = async (dateTimeStart, dateTimeEnd) => {
  console.log("get event");
  try {
    let response = await calendar.events.list({
      auth: auth,
      calendarId: calendarId,
      timeMin: dateTimeStart,
      timeMax: dateTimeEnd,
      timeZone: "Europe/Stockholm",
    });

    let items = response["data"]["items"];
    // filtering(items);
    return items;
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return 0;
  }
};

module.exports.filtering = (res) => {
  let result = [];
  const hoursOffset = 1;
  const room1 = "cage";
  const todayDateMonth = new Date().getDate();
  const todayDateHour = new Date().getHours();
  const filtered = res.filter(
    (element) => new Date(element.start.dateTime).getDate() === todayDateMonth
  );
  const filterRes = filtered.filter(
    (element) =>
      new Date(element.start.dateTime).getUTCHours() + 2 < todayDateHour + 1
  );
  if (filterRes.length === 0) {
    result.push(room1);
  }
  filterRes.forEach((element) => {
    console.log("element", element);
    const d = new Date(element.start.dateTime);
    const hour = d.getUTCHours() + 2;
    console.log("hour", hour);
    const day = d.getDate();
    if (
      element.attendees &&
      element.attendees[0].email !== "shared.meeting.room1@gmail.com" &&
      day === todayDateMonth &&
      hour >= todayDateHour
    ) {
      if (!result.includes(room1)) {
        result = [];
        result.push(room1);
        console.log("you can book");
      }
    } else if (
      !element.attendees &&
      day === todayDateMonth &&
      hour >= todayDateHour &&
      hour <= todayDateHour + hoursOffset
    ) {
      if (!result.includes(room1)) {
        result = [];
        result.push(room1);
        console.log("you can book");
      }
    }
    // else {
    //   if (result.length === 0) {
    //     result = [];
    //     result.push("there is no free room now!");
    //     console.log("you can not book");
    //   }
    // }
  });
  if (result.length === 0) {
    return "there is no free room now!";
  }
  return "Available rooms are: " + result.join("-");
};

module.exports.eventHandler = async ({ command, ack, say }) => {
  try {
    let start = "2022-03-03T00:00:00.000Z";
    let end = "2022-05-04T00:00:00.000Z";
    await ack();
    let result = await module.exports.getEvents(start, end);
    let finalResult = module.exports.filtering(result);
    console.log("return----->", finalResult);
    say(finalResult);
  } catch (error) {
    console.log(`Error in processing /room command: ${error}`);
  }
};