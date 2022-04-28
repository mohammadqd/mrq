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

// Your TIMEOFFSET Offset
const TIMEOFFSET = "+05:30";

// Get date-time string for calender
const dateTimeForCalander = () => {
  let date = new Date();

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  let day = date.getDate();
  if (day < 10) {
    day = `0${day}`;
  }
  let hour = date.getHours();
  if (hour < 10) {
    hour = `0${hour}`;
  }
  let minute = date.getMinutes();
  if (minute < 10) {
    minute = `0${minute}`;
  }

  let newDateTime = `${year}-${month}-${day}T${hour}:${minute}:00.000${TIMEOFFSET}`;

  let event = new Date(Date.parse(newDateTime));

  let startDate = event;
  // Delay in end time is 1
  let endDate = new Date(
    new Date(startDate).setHours(startDate.getHours() + 1)
  );

  return {
    start: startDate,
    end: endDate,
  };
};

console.log("date", dateTimeForCalander());
// Insert new event to Google Calendar
const insertEvent = async (event) => {
  try {
    let response = await calendar.events.insert({
      auth: auth,
      calendarId: calendarId,
      resource: event,
    });

    if (response["status"] == 200 && response["statusText"] === "OK") {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(`Error at insertEvent --> ${error}`);
    return 0;
  }
};

let dateTime = dateTimeForCalander();

// Event for Google Calendar
let event = {
  summary: `This is the summary.`,
  description: `This is the description.`,
  start: {
    dateTime: dateTime["start"],
    timeZone: "Europe/Stockholm",
  },
  end: {
    dateTime: dateTime["end"],
    timeZone: "Europe/Stockholm",
  },
};

// insertEvent(event)
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

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

let start = "2022-03-03T00:00:00.000Z";
let end = "2022-05-04T00:00:00.000Z";

getEvents(start, end)
  .then((res) => {
    // console.log(res[1].attendees);

    filtering(res);

    // console.log("res", res);

    // res.forEach((element) => {
    //   if (element.attendees) {
    //     console.log("el", element.attendees);
    //   }
    //   // if (element.attendees[0].email === "shared.meeting.room1@gmail.com") {
    //   //   console.log(element);
    //   // }
    // });
    // console.log(res[1].attendees[0].email);
  })
  .catch((err) => {
    console.log(err);
  });

const filtering = (res) => {
  let busyRooms = [];
  const hoursOffset = 1;
  const room1 = "shared.meeting.room1@gmail.com";
  var todayDateMonth = new Date().getDate();
  var todayDateHour = new Date().getHours();
  console.log("todayDateHour", todayDateHour);
  res.forEach((element) => {
    const d = new Date(element.start.dateTime);
    const hour = d.getUTCHours() + 2;
    const day = d.getDate();

    console.log(d.getUTCHours() + 2); // Hours
    // console.log(d.getUTCMinutes());
    if (
      element.attendees &&
      element.attendees[0].email !== "shared.meeting.room1@gmail.com" &&
      day === todayDateMonth &&
      hour >= todayDateHour &&
      hour <= todayDateHour + hoursOffset
    ) {
      if (!busyRooms.includes(room1)) {
        busyRooms.push(room1);
      }
      console.log("you can get this room now->", busyRooms);
    } else if (
      !element.attendees &&
      day === todayDateMonth &&
      hour >= todayDateHour &&
      hour <= todayDateHour + hoursOffset
    ) {
      console.log("no attendees");
      if (!busyRooms.includes(room1)) {
        busyRooms.push(room1);
      }
      console.log("You can get this room now->", busyRooms);
    } else {
      console.log("there is no free room now!");
    }
  });
};

// Delete an event from eventID
const deleteEvent = async (eventId) => {
  try {
    let response = await calendar.events.delete({
      auth: auth,
      calendarId: calendarId,
      eventId: eventId,
    });

    if (response.data === "") {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(`Error at deleteEvent --> ${error}`);
    return 0;
  }
};

// let eventId = "hkkdmeseuhhpagc862rfg6nvq4";

// deleteEvent(eventId)
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = async ({ command, ack, say }) => {
  try {
    let start = "2022-03-03T00:00:00.000Z";
    let end = "2022-05-04T00:00:00.000Z";
    await ack();
    say(getEvents(start, end));
  } catch (error) {
    console.log(`Error in processing /room command: ${error}`);
  }
};
