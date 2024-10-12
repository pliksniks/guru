import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

export const ServerEnvs = {
  DiscordToken: process.env.DISCORD_TOKEN,
  DiscordGuildId: process.env.DISCORD_GUILD_ID,
  DiscordClientId: process.env.DISCORD_CLIENT_ID,
}

if (!ServerEnvs.DiscordToken) {
  throw new Error('DISCORD_TOKEN is not set in the environment variables')
}
