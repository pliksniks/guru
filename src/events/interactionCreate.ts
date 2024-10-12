import {
  Client,
  Interaction,
  Collection,
  CommandInteraction,
  SlashCommandBuilder,
  ModalSubmitInteraction,
} from 'discord.js'
import { readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface Command {
  data: SlashCommandBuilder
  execute: (interaction: CommandInteraction) => Promise<void>
}

interface ModalHandler {
  customId: string
  execute: (interaction: ModalSubmitInteraction) => Promise<void>
}

const commands = new Collection<string, Command>()
const modalHandlers = new Collection<string, ModalHandler>()

// Load commands
const commandsPath = join(__dirname, '..', 'commands', 'slash')
const commandFiles = readdirSync(commandsPath).filter((file) =>
  file.endsWith('.ts'),
)

for (const file of commandFiles) {
  const filePath = join(commandsPath, file)
  import(filePath)
    .then((commandModule) => {
      const command = commandModule.default as Command
      if ('data' in command && 'execute' in command) {
        commands.set(command.data.name, command)
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        )
      }
    })
    .catch((error) => {
      console.error(`Error importing command file ${file}:`, error)
    })
}

// Load modal handlers (if the directory exists)
const modalsPath = join(__dirname, '..', 'modals')
console.log(`Checking for modals directory at: ${modalsPath}`)
if (existsSync(modalsPath)) {
  console.log('Modals directory found. Attempting to load modal handlers...')
  const modalFiles = readdirSync(modalsPath).filter((file) =>
    file.endsWith('.ts'),
  )
  console.log(`Found ${modalFiles.length} modal handler files`)

  for (const file of modalFiles) {
    const filePath = join(modalsPath, file)
    console.log(`Attempting to import modal handler from: ${filePath}`)
    import(filePath)
      .then((modalModule) => {
        const modal = modalModule.default as ModalHandler
        if ('customId' in modal && 'execute' in modal) {
          modalHandlers.set(modal.customId, modal)
          console.log(`Successfully loaded modal handler: ${modal.customId}`)
        } else {
          console.log(
            `[WARNING] The modal handler at ${filePath} is missing a required "customId" or "execute" property.`,
          )
        }
      })
      .catch((error) => {
        console.error(`Error importing modal handler file ${file}:`, error)
      })
  }
} else {
  console.log(
    '[INFO] No modals directory found. Skipping modal handlers loading.',
  )
}

async function onInteractionCreate(client: Client, interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error('Error executing command:', error)
      await handleInteractionError(interaction)
    }
  } else if (interaction.isModalSubmit()) {
    const modalHandler = modalHandlers.get(interaction.customId)

    if (!modalHandler) {
      console.error(
        `No modal handler matching ${interaction.customId} was found.`,
      )
      return
    }

    try {
      await modalHandler.execute(interaction)
    } catch (error) {
      console.error('Error handling modal submission:', error)
      await handleInteractionError(interaction)
    }
  }
}

async function handleInteractionError(
  interaction: CommandInteraction | ModalSubmitInteraction,
) {
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({
      content: 'There was an error while processing your interaction!',
      ephemeral: true,
    })
  } else {
    await interaction.reply({
      content: 'There was an error while processing your interaction!',
      ephemeral: true,
    })
  }
}

export default onInteractionCreate
