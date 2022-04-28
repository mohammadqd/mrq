const recommendLunch = async () => {
    return `No recommendation for lunch!`;
}

module.exports = async ({ command, ack, say }) => {
    try {
        await ack();
        const result = await recommendLunch();
        say(result);
    } catch (error) {
        console.log(`Error in processing /lunch command: ${error}`);
    }
}