const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { calcEndTime } = require("../utils/calcEndTime");
const moment = require("moment-timezone");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filapiso")
    .setDescription("Verifica as filas que ja foram claimadas por andar"),

  async execute(interaction) {
    try {
      const channel = interaction.channel;
      const floor = channel.name.slice(0, 2).toUpperCase();
      const floorQueues = fs.readdirSync(`./src/magic-square/${floor}`);
      let queues = {};
      let messagesString;

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
          `:loudspeaker: Não ha ninguem em nenhuma fila nesse andar \n  ------------------`
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

      interaction.reply({
        content: `:arrow_down:  AS FILAS CLAIMADAS NO ${floor} SÃO  :arrow_down: \n${messagesString} \n\n :loudspeaker: Todas as outras não listadas a cima estão livre \n------------------`,
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
