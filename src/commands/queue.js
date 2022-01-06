const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

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
    .setName("queue")
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
      const queue = new Queue();
      const queueFile = JSON.parse(
        fs.readFileSync(`./src/magic-square/${floor}/${formattedChamber}`)
      );
      let uiChamberName;
      let uiChamberNumber;

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
      queue.items = queueFile;
      if (queueFile.length == 0) {
        await interaction.reply({
          ephemeral: true,
          content: ":loudspeaker:  Não há ninguem nesta fila",
        });
        return;
      }
      await interaction.reply({
        content: `${queue.items.map((item, index) => {
          if (item.userName == interaction.user.username) {
            return `A posição de ${item.userName} na fila é ${index + 1}`;
          }
        })}`,
      });
      await interaction.followUp({
        ephemeral: true,
        content: `Esse é a lista atualizada de jogadores na fila. \n
1.  :video_game: ${
          queue.items[0].userName
        } is on: ${uiChamberName} ${uiChamberNumber}. ${
          queue.items[0].spot.floor
        },${queue.items.slice(1).map((item, index) => {
          return `\n${index + 2}. :stopwatch: ${
            item.userName
          } esta esperando sua vez na fila: ${uiChamberName} ${uiChamberNumber}. ${
            item.spot.floor
          }`;
        })}`,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
