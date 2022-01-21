const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { calcEndTime } = require("../utils/calcEndTime");
const moment = require("moment-timezone");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filachamber")
    .setDescription(
      "Escolha as filas que deseja ver dentre: experience, gold ou magic-stone"
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
    ),

  async execute(interaction) {
    try {
      const chamberName = interaction.options.getString("chambername");
      const channel = interaction.channel;
      let queues = {};
      let messagesString;
      let uiChamberName;

      let floor;

      if (channel.name.includes("1f")) {
        floor = "1F";
      }
      if (channel.name.includes("2f")) {
        floor = "2F";
      }
      if (channel.name.includes("3f")) {
        floor = "3F";
      }
      if (channel.name.includes("4f")) {
        floor = "4F";
      }
      if (channel.name.includes("5f")) {
        floor = "5F";
      }
      if (channel.name.includes("6f")) {
        floor = "6F";
      }
      const floorQueues = fs
        .readdirSync(`./src/magic-square/${floor}`)
        .filter((file) => file.startsWith(`${chamberName}`));

      const mapNonEmptyQueues = floorQueues.map((queue) => {
        let queueFile = JSON.parse(
          fs.readFileSync(`./src/magic-square/${floor}/${queue}`)
        );
        if (queueFile.length > 0) {
          return Object.assign(queues, {
            [queue]: queueFile,
          });
        }
      });

      if (mapNonEmptyQueues.every((queue) => queue === undefined)) {
        interaction.reply(
          `:loudspeaker: Não ha ninguem em nenhuma fila nesse andar e chamber especifica! \n  ------------------`
        );
        return;
      }

      const formattedQueues = Object.entries(queues).map(
        ([queueName, queueInfo]) => {
          let info;
          const formattedQueueName = queueName
            .replace(/[^a-zA-Z0-9]+/g, " ")
            .slice(0, -5);
          const finishQueueName = formattedQueueName.replace(
            /(^\w{1})|(\s+\w{1})/g,
            (letter) => letter.toUpperCase()
          );
          if (queueInfo.length === 1) {
            info = queueInfo[0];
          } else {
            info = [queueInfo[0], queueInfo[1]];
          }

          return (queues = { [finishQueueName]: info });
        }
      );

      const mapQueues = formattedQueues.map(
        (queue) =>
          `\n :page_facing_up: ${Object.keys(
            queue
          )} => Claimavel a partir de: ${Object.values(queue)
            .map((queue01) => {
              if (queue01.length === undefined) {
                return Object.values(queue01);
              } else {
                return Object.values(queue01).map((queue02) =>
                  Object.values(queue02)
                );
              }
            })
            .toString()
            .slice(-13)}`
      );

      const adjustClaimableTime = mapQueues.map((queue) => {
        const getNumber = Number(queue.slice(-13)) - 300000;
        let formatNumber = moment
          .tz(getNumber, "America/Sao_Paulo")
          .format()
          .slice(11, 16);
        formatNumber = formatNumber.concat(" Horas");
        return queue.slice(0, -13).concat(formatNumber);
      });

      messagesString = adjustClaimableTime.join();

      switch (chamberName) {
        case "gold":
          uiChamberName = "Gold Chamber";
          break;
        case "experience":
          uiChamberName = "Experience Chamber";
          break;
        case "magic-stone":
          uiChamberName = "Magic Stone Chamber";
          break;
        default:
          break;
      }

      interaction.reply({
        content: `:arrow_down:  AS FILAS CLAIMADAS NA ${uiChamberName.toUpperCase()} ${floor} SÃO  :arrow_down: \n${messagesString} \n\n :loudspeaker: Todas as outras não listadas a cima estão livre\n ------------------`,
        ephemeral: true,
      });
    } catch (error) {
      interaction.reply({
        content: `Um erro aconteceu ao executar esse comando, por favor verifique com a staff.\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
