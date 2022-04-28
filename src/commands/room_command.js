
module.exports = async ({ command, ack, say }) => {
  try {
    await ack();
    say("No meeting room is available right now!!");
  } catch (error) {
    console.log(`Error in processing /room command: ${error}`)
  }
}