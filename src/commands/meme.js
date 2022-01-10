const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { MessageAttachment, MessageEmbed, Message } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Envia um meme aleatorio"),

  async execute(interaction, message) {
    try {
      const channel = interaction.channel;
      if (!channel.name.includes("geral")) {
        await interaction.reply(
          `:no_entry_sign: Esse comando só pode ser usado na sala Geral :no_entry_sign:`
        );
        return;
      }
      const memes = fs.readdirSync(`./src/images`);

      const randomizeMemes = (array) => {
        let currentIndex = array.length,
          randomIndex;

        while (currentIndex != 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
          ];
        }
        return array;
      };
      const randomizedMemes = randomizeMemes(memes);

      const attachment = new MessageAttachment(
        `./src/images/${randomizedMemes[0]}`
      );
      const embed = new MessageEmbed().setImage(`attachment://${attachment}`);

      await interaction.reply({
        content: ":arrow_down: Claimer-bot bota a redz pra mamar :arrow_down:",
        files: [attachment],
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
