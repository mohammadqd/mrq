const fs = require('fs')


const getRestaurant = async () => {
    let restaurantsRawData = fs.readFileSync('./src/data/restaurants_db.json');
    let restaurantsDB = JSON.parse(restaurantsRawData);
    let message = { blocks: [] };
    const chosenRestaurantIndex = Math.floor(Math.random() * restaurantsDB.restaurants.length);
    const chosenRestaurant = restaurantsDB.restaurants[chosenRestaurantIndex];
    message.blocks = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Restaurant:* ${chosenRestaurant?.title}`
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Info:* ${chosenRestaurant?.info}`
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Address:* ${chosenRestaurant?.address} <${chosenRestaurant?.location}|open it!>`
            }
        },
        {
			type: "image",
			image_url: chosenRestaurant?.picture,
			alt_text: chosenRestaurant?.title
		},
        {
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Reserve it now!",
						emoji: true
					},
					value: "click_me_123",
					action_id: "actionId-0"
				}
			]
		},


    ];
    // console.log(`Recommending restaurant!`);
    return (message);
}

module.exports = async ({ command, text, ack, say }) => {
    try {
        await ack();
        const result = await getRestaurant();
        say(result);
    } catch (error) {
        console.log(`Error in processing /restaurant command: ${error}`);
    }
};

// ------------------------
// Stand alone test 
// ------------------------

// getRestaurant().then(msg => console.log(msg));