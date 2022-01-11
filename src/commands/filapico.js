const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const moment = require("moment-timezone");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filapico")
    .setDescription(
      "Mostra a fila de jogadores requisitada por qual andar e position na Secret Peak"
    )
    .addStringOption((option) =>
      option
        .setName("floor")
        .setDescription("Secret Peak Floor (2F)")
        .setRequired(true)
        .addChoice("2F", "2F")
    )
    .addStringOption((option) =>
      option
        .setName("position")
        .setDescription("Choose between Upper or Down and respective locations")
        .setRequired(true)
        .addChoice("Cima Norte", "upper-north")
        .addChoice("Cima Sul", "upper-south")
        .addChoice("Baixo Direita", "down-right")
        .addChoice("Baixo Esquerda", "down-left")
    ),

  async execute(interaction) {
    try {
      const floor = interaction.options.getString("floor");
      const position = interaction.options.getString("position");
      const client = interaction.client;
      const guild = client.guilds.cache.get("929493313927647303");

      const queueFile = JSON.parse(
        fs.readFileSync(
          `./src/secret-peak/${floor}/${position}-aggressive.json`
        )
      );
      let uiChamberName;

      switch (position) {
        case "upper-north":
          uiChamberName = "Cima Norte";
          break;
        case "upper-south":
          uiChamberName = "Cima Sul";
          break;
        case "down-right":
          uiChamberName = "Baixo Direita";
          break;
        case "down-left":
          uiChamberName = "Baixo Esquerda";
          break;

        default:
          break;
      }
      const endsAtMap = Array.from(queueFile).map((player, index) => {
        return moment.tz(player.endsAt, "America/Sao_Paulo").format();
      });
      const startedAtMap = Array.from(queueFile).map((player, index) => {
        return moment.tz(player.startedAt, "America/Sao_paulo").format();
      });

      const formattedEnds = endsAtMap.map((date) => date.slice(11, 19));
      const formattedStarted = startedAtMap.map((date) => date.slice(11, 19));

      if (queueFile.length == 0) {
        await interaction.reply({
          ephemeral: true,
          content:
            ":loudspeaker:  Não há ninguem nesta fila\n ------------------",
        });
        return;
      }
      if (queueFile.length == 1) {
        await interaction.reply({
          ephemeral: true,
          content: `---- Fila ${floor} ${uiChamberName} Agressivo ----\n\n :video_game: 1- ${
            queueFile[0].userName
          }:\n Tickets: ${queueFile[0].spot.tickets / 30}\n Inicio: ${moment
            .tz(queueFile[0].startedAt, "America/Sao_Paulo")
            .format()
            .slice(11, 16)}\n Termino: ${moment
            .tz(queueFile[0].endsAt, "America/Sao_Paulo")
            .format()
            .slice(11, 16)}\n ------------------`,
        });
      }
      if (queueFile.length == 2) {
        await interaction.reply({
          ephemeral: true,
          content: `---- Fila ${floor} ${uiChamberName} Agressivo ----\n\n:video_game: 1- ${
            queueFile[0].userName
          }: \n Tickets: ${queueFile[0].spot.tickets / 30}\n Inicio: ${moment
            .tz(queueFile[0].startedAt, "America/Sao_Paulo")
            .format()
            .slice(11, 16)}\n Termino: ${moment
            .tz(queueFile[0].endsAt, "America/Sao_Paulo")
            .format()
            .slice(11, 16)}\n \n:stopwatch: 2- ${
            queueFile[1].userName
          }:\n Tickets: ${queueFile[1].spot.tickets / 30}\n Inicio: ${moment
            .tz(queueFile[1].startedAt, "America/Sao_Paulo")
            .format()
            .slice(11, 16)}\n Termino: ${moment
            .tz(queueFile[1].endsAt, "America/Sao_Paulo")
            .format()
            .slice(11, 16)}\n ------------------`,
        });
      }
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
