const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const moment = require("moment-timezone");

class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    if (this.items.length === 0) return;
    return this.items[0];
  }

  getSize() {
    return this.items.length;
  }

  isEmpty() {
    return this.getSize() === 0;
  }
}

/** To Do
 * [x] Transform json queue into a array of objects
 * [x] Add more than 1 user to queue array
 * [] Show startedAt(UTC - Hora, Minuto, segundo || msegundo) Property on queue of each player
 */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filapraca")
    .setDescription(
      "Mostra a fila de jogadores requisitada por qual andar, nome da chamber e numero da chamber"
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
        .addChoice("Gold Chamber", "gold")
        .addChoice("Experience Chamber", "experience")
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
    )
    .addStringOption((option) =>
      option
        .setName("position")
        .setDescription("Escolha entre Esquerda - Meio ou Direita")
        .setRequired(true)
        .addChoice("Esquerda", "left")
        .addChoice("Meio", "middle")
        .addChoice("Right", "right")
    ),

  async execute(interaction) {
    try {
      const floor = interaction.options.getString("floor");
      const chamberName = interaction.options.getString("chambername");
      const chamberNumber = interaction.options.getString("chambernumber");
      const position = interaction.options.getString("position");
      const formattedChamber = `${chamberName}-${chamberNumber}-${position}.json`;

      const queueFile = JSON.parse(
        fs.readFileSync(`./src/magic-square/${floor}/${formattedChamber}`)
      );

      let uiChamberName;
      let uiChamberNumber;

      const client = interaction.client;
      const guild = interaction.guild;
      const channel = interaction.channel;

      switch (chamberName) {
        case "gold":
          uiChamberName = "Gold Chamber";
          break;
        case "experience":
          uiChamberName = "Experience Chamber";
          break;
        case "training":
          uiChamberName = "Training Chamber";
          break;
        case "white-silver":
          uiChamberName = "White Silver Chamber";
          break;
        case "magic-stone":
          uiChamberName = "Magic Stone Chamber";
          break;
        default:
          break;
      }

      if (chamberNumber === "1") {
        uiChamberNumber = "I";
      }
      if (chamberNumber === "2") {
        uiChamberNumber = "II";
      }
      if (chamberNumber === "3") {
        uiChamberNumber = "III";
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
          content: `---- Fila ${floor} ${uiChamberName} ${uiChamberNumber} ----\n\n :video_game: 1- ${
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
          content: `---- Fila ${floor} ${uiChamberName} ${uiChamberNumber} ----\n\n:video_game: 1- ${
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
      //       await interaction.followUp({
      //         ephemeral: true,
      //         content: `Esse é a lista atualizada de jogadores na fila. \n
      // 1.  :video_game: ${
      //           queueFile[0].userName
      //         } is on: ${uiChamberName} ${uiChamberNumber}. ${
      //           queueFile[0].spot.floor
      //         },${Array.from(queueFile)
      //           .slice(1)
      //           .map((item, index) => {
      //             return `\n${index + 2}. :stopwatch: ${
      //               item.userName
      //             } esta esperando sua vez na fila: ${uiChamberName} ${uiChamberNumber}. ${
      //               item.spot.floor
      //             }`;
      //           })}`,
      //       });
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
