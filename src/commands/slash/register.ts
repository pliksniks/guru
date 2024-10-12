import {
  TextInputStyle,
  SlashCommandBuilder,
  CommandInteraction,
  TextInputBuilder,
  ModalBuilder,
  ActionRowBuilder,
} from 'discord.js'

const data = new SlashCommandBuilder()
  .setName('register')
  .setDescription('Register new user.')

async function execute(interaction: CommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('registerModal')
    .setTitle('Register')

  const username = new TextInputBuilder()
    .setCustomId('username')
    .setLabel('Username')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    username,
  )

  modal.addComponents(firstActionRow)

  await interaction.showModal(modal)
}

export default { data, execute }
