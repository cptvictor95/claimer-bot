const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription(
      "Claim magic square spot based on Floor, Chamber Name and Number and Tickets used (2 tickets maximum)"
    )
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
        .addChoice("Gold Chamber", "Gold Chamber")
        .addChoice("White Silver Chamber", "White Silver Chamber")
        .addChoice("Experience Chamber", "Experience Chamber")
        .addChoice("Training Chamber", "Training Chamber")
        .addChoice("Magic Stone Chamber", "Magic Stone Chamber")
    )
    .addStringOption((option) =>
      option
        .setName("chambernumber")
        .setDescription("Magic Square Chamber Number (I/II/III)")
        .setRequired(true)
        .addChoice("Chamber I", "I")
        .addChoice("Chamber II", "II")
        .addChoice("Chamber III", "III")
    )
    .addStringOption((option) =>
      option
        .setName("tickets")
        .setDescription("Number of tickets used: 1 or 2")
        .setRequired(true)
        .addChoice("1", "30 minutes")
        .addChoice("2", "1 hour")
    ),
  async execute(interaction) {
    try {
      if (!interaction.isCommand) return;
      const floor = interaction.options.getString("floor");
      const chamberName = interaction.options.getString("chambername");
      const chamberNumber = interaction.options.getString("chambernumber");
      const tickets = interaction.options.getString("tickets");

      let queue = JSON.parse(fs.readFileSync("./src/data/queue.json"));
      console.info("queue", queue);

      const player = {
        userName: interaction.user.username,
        spot: {
          floor: floor,
          name: chamberName,
          number: chamberNumber,
          tickets: tickets,
        },
      };

      console.info("playerToEnqueue", player);
      fs.writeFileSync("./src/data/queue.json", JSON.stringify(player));

      await interaction.reply(
        `${interaction.user.username} claimed ${
          chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
        } ${chamberNumber} on ${floor} for ${tickets}.`
      );
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
