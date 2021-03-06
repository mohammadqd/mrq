const { getEvents, filtering } = require("./room_command");
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
const TIMEOFFSET = "+02:00";
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
  let startHour = date.getHours();
  if (startHour < 10) {
    startHour = `0${startHour}`;
  }
  let endHour = date.getHours() + 1;
  if (endHour < 10) {
    endHour = `0${endHour}`;
  }
  let minute = date.getMinutes();
  if (minute < 10) {
    minute = `0${minute}`;
  }

  let startDateTime = `${year}-${month}-${day}T${startHour}:${minute}:00.000${TIMEOFFSET}`;
  let endDateTime = `${year}-${month}-${day}T${endHour}:00:00.000${TIMEOFFSET}`;

  let startDate = new Date(Date.parse(startDateTime));
  let endDate = new Date(Date.parse(endDateTime));

  // let startDate = event;
  // Delay in end time is 1
  // let endDate = new Date(
  //   new Date(startDate).setHours(startDate.getHours() + 1)
  // );

  return {
    start: startDate,
    end: endDate,
  };
};

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
  summary: `Cage room Booked!`,
  description: `This room has booked by the Bot!`,
  start: {
    dateTime: dateTime["start"],
    timeZone: "Europe/Stockholm",
  },
  end: {
    dateTime: dateTime["end"],
    timeZone: "Europe/Stockholm",
  },
};
const sending = async () => {
  let result = await getEvents(
    "2022-03-03T00:00:00.000Z",
    "2022-05-04T00:00:00.000Z"
  );

  let finalResult = filtering(result);
  console.log("finalResult", finalResult);
  if (!finalResult.includes("roomName")) {
    insertEvent(event)
      .then((res) => {
        console.log("room is booked", res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
sending();
// module.exports = async ({ command, ack, say }) => {
//   try {
//     let start = "2022-03-03T00:00:00.000Z";
//     let end = "2022-05-04T00:00:00.000Z";
//     await ack();
//     let result = await insertEvent(event);
//     say("booked");
//   } catch (error) {
//     console.log(`Error in processing /room command: ${error}`);
//   }
// };

// insertEvent(event);
