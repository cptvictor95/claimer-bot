const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Server basic infos."),
  async execute(interaction) {
    await interaction.reply(
      `Nome do server: ${interaction.guild.name}\nTotal de membros: ${interaction.guild.memberCount}`
    );
  },
};
