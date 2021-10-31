const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows a list with all the commands and descriptions."),
  async execute(interaction) {
    try {
      const commands = interaction.client.commands;

      const commandList = commands.map((command) => {
        const infos = `\n/${command.data.name} - ${command.data.description}`;

        return infos;
      });

      await interaction.reply(`Full list of commands: \n${commandList}`);
    } catch (error) {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
      throw new Error(error.message);
    }
  },
};
