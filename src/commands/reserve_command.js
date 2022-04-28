const Reserve = async (roomName) => {
    return `room ${roomName} reserved for you!`;
}

module.exports = async ({ command, ack, say }) => {
    try {
        await ack();
        const result = await Reserve(command.text);
        say(result);
    } catch (error) {
        console.log("err");
        console.error(error);
    }
}