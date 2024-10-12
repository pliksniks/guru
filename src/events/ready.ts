import { Client } from 'discord.js';

function onReady(client: Client) {
	console.log(`Logged in as ${client.user?.tag}`);
}

export default onReady;
