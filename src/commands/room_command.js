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
  const room1 = "cage";
  let result = [room1];
  const hoursOffset = 1;
  const todayDateMonth = new Date().getDate();
  const todayDateHour = new Date().getHours();
  const todayDateMin = new Date().getMinutes();
  const filtered = res.filter(
    (element) => new Date(element.start.dateTime).getDate() === todayDateMonth
  );
  // const filterRes = filtered.filter(
  //   (element) =>
  //     new Date(element.start.dateTime).getUTCHours() + 2 < todayDateHour + 1
  // );
  // if (filtered.length === 0) {
  //   result.push(room1);
  // }
  filtered.forEach((element) => {
    // console.log("element", element);
    const startTime = new Date(element.start.dateTime);
    const endTime = new Date(element.end.dateTime);
    const startHour = startTime.getUTCHours();
    const endMin = startTime.getUTCMinutes();
    const endHour = endTime.getUTCHours();
    if (
      element.attendees &&
      element.attendees[0].email === "shared.meeting.room1@gmail.com" &&
      (endHour > todayDateHour ||
        (endHour === todayDateHour && endMin > todayDateMin)) &&
      startHour < todayDateHour + 1
    ) {
      result = [];
    }
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
    say(finalResult);
  } catch (error) {
    console.log(`Error in processing /room command: ${error}`);
  }
};
