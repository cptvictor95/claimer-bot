const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Mostra a lista de comandos utilizaveis, suas funcionalidades e como utilizar"
    ),
  async execute(interaction) {
    try {
      const commands = interaction.client.commands;

      const commandList = commands.map((command) => {
        const infos = `\n/${command.data.name} - ${command.data.description}`;

        return infos;
      });

      await interaction.reply(`Lista completa de comandos: \n${commandList}`);
    } catch (error) {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
      throw new Error(error.message);
    }
  },
};
