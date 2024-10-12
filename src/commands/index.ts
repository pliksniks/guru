import { Collection, Interaction } from 'discord.js'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export interface Command {
  execute(interaction: Interaction): void
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const commands: Collection<string, Command> = new Collection()
const commandFiles = readdirSync(__dirname).filter(
  (file) => file.endsWith('.ts') && file !== 'index.ts',
)

for (const file of commandFiles) {
  const command = await import(join(__dirname, file))
  commands.set(command.data.name, command)
}

export { commands }
