module.exports = async ({ command, say }) => {
    try {
      say("What?!");
    } catch (error) {
        console.log("err")
      console.error(error);
    }
  }