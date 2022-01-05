const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder().setName("user").setDescription("User infos."),
  async execute(interaction) {
    await interaction.reply(
      `Olá, ${interaction.user.username}!\nSua tag é: ${interaction.user.tag}\nSeu id é: ${interaction.user.id}`
    );
  },
};
