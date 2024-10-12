import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ServerEnvs } from './ServerEnvs.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const commands = []
const commandsPath = join(__dirname, 'commands')

async function getCommandFiles(dir: string): Promise<string[]> {
  const entries = readdirSync(dir, { withFileTypes: true })

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        return getCommandFiles(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        return fullPath
      } else {
        return []
      }
    }),
  )

  return files.flat()
}

const commandFiles = await getCommandFiles(commandsPath)

for (const file of commandFiles) {
  try {
    const commandModule = await import(file)
    let command

    if (commandModule.default && typeof commandModule.default === 'object') {
      command = commandModule.default
    } else if (typeof commandModule === 'object') {
      command = commandModule
    }

    if (command && command.data && typeof command.data.toJSON === 'function') {
      commands.push(command.data.toJSON())
    } else {
      console.warn(
        `Warning: Skipping file ${file} due to invalid command structure`,
      )
    }
  } catch (error) {
    console.error(`Error loading command from file ${file}:`, error)
  }
}

if (commands.length === 0) {
  console.warn(
    'No valid commands were loaded. Check your command files and structure.',
  )
  process.exit(1)
}

// Check for required environment variables
if (!ServerEnvs.DiscordToken) {
  console.error('Error: DISCORD_TOKEN is not set in the environment variables.')
  process.exit(1)
}

if (!ServerEnvs.DiscordClientId) {
  console.error(
    'Error: DISCORD_CLIENT_ID is not set in the environment variables.',
  )
  process.exit(1)
}

if (!ServerEnvs.DiscordGuildId) {
  console.error(
    'Error: DISCORD_GUILD_ID is not set in the environment variables.',
  )
  process.exit(1)
}

const rest = new REST({ version: '9' }).setToken(ServerEnvs.DiscordToken!)

try {
  console.log('Started refreshing application (/) commands.')

  await rest.put(
    Routes.applicationGuildCommands(
      ServerEnvs.DiscordClientId,
      ServerEnvs.DiscordGuildId,
    ),
    { body: commands },
  )

  console.log('Successfully reloaded application (/) commands.')
} catch (error) {
  console.error('Error refreshing application commands:', error)
  if (error instanceof Error) {
    console.error(
      'Make sure DISCORD_CLIENT_ID and DISCORD_GUILD_ID are correctly set and are valid Discord IDs.',
    )
  }
}
