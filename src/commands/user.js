const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder().setName("user").setDescription("User infos."),
  async execute(interaction) {
    await interaction.reply(
      `Hello ${interaction.user.username}!\nYour tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
    );
  },
};
