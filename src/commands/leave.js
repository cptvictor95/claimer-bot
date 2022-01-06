const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Sai da fila que estava"),
  async execute(interaction) {
    try {
      const client = interaction.client;
      const guild = client.guilds.cache.get("903985002650411049");
      const channel = guild.channels.cache.get("903985002650411052");
      const member = interaction.member;
      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );

      const data = fs
        .readdirSync("./src/data")
        .filter((file) => file.endsWith("F"));
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
