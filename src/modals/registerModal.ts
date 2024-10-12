import { ModalSubmitInteraction } from 'discord.js'
import { isLevelThree, fetchUserData } from '../api/fetchUserData'

const modalHandler = {
  customId: 'registerModal',
  async execute(interaction: ModalSubmitInteraction) {
    const username = interaction.fields.getTextInputValue('username')

    try {
      const response = await fetchUserData(username)
      const combatCheck = await isLevelThree(response)
      const passMessage = combatCheck
        ? `Successfully registered ${username}! You passed the level 3 check!`
        : `You did not pass the level 3 check for ${username}.`

      if (response) {
        await interaction.reply({
          content: passMessage,
          ephemeral: true,
        })
      } else {
        await interaction.reply({
          content:
            'There was an error registering your account. Please try again later.',
          ephemeral: true,
        })
      }
    } catch (error) {
      console.error('Error calling API:', error)
      await interaction.reply({
        content:
          'There was an error processing your registration. Please try again later.',
        ephemeral: true,
      })
    }
  },
}

export default modalHandler
