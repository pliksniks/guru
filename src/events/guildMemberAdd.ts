import { Client, GuildMember } from 'discord.js';

function onGuildMemberAdd(client: Client, member: GuildMember) {
	const role = member.guild.roles.cache.find((r) => r.name === 'Member');
	if (role) {
		member.roles.add(role).catch(console.error);
	}
}

export default onGuildMemberAdd;
