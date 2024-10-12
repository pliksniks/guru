import { Client, Events, GatewayIntentBits } from 'discord.js'
import { ServerEnvs } from './ServerEnvs'
import { loadEvents } from './utils/helpers'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
  ],
})

loadEvents(client)

client.login(ServerEnvs.DiscordToken)

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag}`)
})

client.on(Events.Error, (error) => {
  console.error('Discord client error:', error)
})
