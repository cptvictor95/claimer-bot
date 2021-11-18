const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a player from the specified queue")
    .addStringOption((option) =>
      option
        .setName("floor")
        .setDescription("Magic Square Floor Number (1F-6F)")
        .setRequired(true)
        .addChoice("1F", "1F")
        .addChoice("2F", "2F")
        .addChoice("3F", "3F")
        .addChoice("4F", "4F")
        .addChoice("5F", "5F")
        .addChoice("6F", "6F")
    )
    .addStringOption((option) =>
      option
        .setName("chambername")
        .setDescription(
          "Magic Square Chamber Name (Gold/White Silver/Experience/Training/Magic Stone)"
        )
        .setRequired(true)
        .addChoice("Gold Chamber", "gold")
        .addChoice("White Silver Chamber", "white-silver")
        .addChoice("Experience Chamber", "experience")
        .addChoice("Training Chamber", "training")
        .addChoice("Magic Stone Chamber", "magic-stone")
    )
    .addStringOption((option) =>
      option
        .setName("chambernumber")
        .setDescription("Magic Square Chamber Number (I/II/III)")
        .setRequired(true)
        .addChoice("Chamber I", "1")
        .addChoice("Chamber II", "2")
        .addChoice("Chamber III", "3")
    ),

  async execute(interaction) {
    try {
      const floor = interaction.options.getString("floor");
      const chamberName = interaction.options.getString("chambername");
      const chamberNumber = interaction.options.getString("chambernumber");
      const formattedChamber = `${chamberName}-${chamberNumber}.json`;
      const client = interaction.client;
      let queue = JSON.parse(
        fs.readFileSync(`./src/data/${floor}/${formattedChamber}`)
      );
      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );

      const queueMap = queue.map((players) => {
        const playersOnQueue = players.id;
        return playersOnQueue;
      });
      const placeOnQueue = queueMap.indexOf(`${user.id}`);

      if (placeOnQueue === -1) {
        interaction.reply({
          ephemeral: true,
          content: `:rotating_light: <@${user.id}> You are not on that queue, certify that you search for the correct queue`,
        });
      }
      const newQueue = queue.splice(placeOnQueue, 1);
      console.log(queue);
      console.log(newQueue);

      fs.writeFileSync(
        `./src/data/${floor}/${formattedChamber}`,
        JSON.stringify(queue)
      );

      await interaction.reply({
        ephemeral: true,
        content: `:white_check_mark: <@${user.id}> you have been removed from the queue`,
      });
    } catch (error) {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
      throw new Error(error.message);
    }
  },
};
