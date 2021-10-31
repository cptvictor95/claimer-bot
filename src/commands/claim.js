const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription(
      "Claim magic square spot based on Floor, Chamber Name and Number and Tickets used (2 tickets maximum)"
    )
    .addIntegerOption((option) =>
      option
        .setName("floor")
        .setDescription("Magic Square Floor Number (1 to 6)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("chambername")
        .setDescription(
          "Magic Square Chamber Name (Gold/White Silver/Experience/Training/Magic Stone)"
        )
        .setRequired(true)
        .addChoice("Gold Chamber", "Gold Chamber")
        .addChoice("Silver Chamber", "Silver Chamber")
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

      const floor = interaction.options.getInteger("floor");
      const chamberName = interaction.options.getString("chambername");
      const chamberNumber = interaction.options.getString("chambernumber");
      const tickets = interaction.options.getString("tickets");

      await interaction.reply(
        `${interaction.user.username} claimed ${
          chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
        } ${chamberNumber} on ${floor}F for ${tickets} tickets`
      );
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
