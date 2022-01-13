const { SlashCommandBuilder } = require("@discordjs/builders");
const { channel } = require("diagnostics_channel");
const fs = require("fs");
const { calcEndTime } = require("../utils/calcEndTime");
const { translatePositionText } = require("../utils/translatePositionText");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Sai da fila que estava"),
  async execute(interaction) {
    try {
      const client = interaction.client;
      const channel = interaction.channel;
      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );

      const queue = JSON.parse(fs.readFileSync("./src/players-on-queue.json"));

      if (queue.length === 0) {
        await interaction.reply({
          content: `:no_entry_sign: <@${user.id}> você não está em nenhuma fila! :no_entry_sign:\n ------------------`,
          ephemeral: true,
        });
        return;
      }

      const removeFromQueue = async () => {
        const findPlayer = queue.find((player) => player.id === user.id);

        if (!findPlayer) {
          await interaction.reply({
            content: `:no_entry_sign: <@${user.id}> você não está em nenhuma fila! :no_entry_sign:\n ------------------`,
            ephemeral: true,
          });
          return;
        }

        const place = findPlayer.place;
        const floor = findPlayer.floor;
        const date = Date.now();
        const spot = findPlayer.spot;
        let formattedSpot;
        let queueOfPlayer;

        queueOfPlayer = JSON.parse(
          fs.readFileSync(`./src/${place}/${findPlayer.floor}/${spot}`)
        );

        const playerInsideQueue = queueOfPlayer.find(
          (player) => player.id === user.id
        );

        switch (playerInsideQueue.spot.name) {
          case "gold":
            formattedSpot = "Gold Chamber";
            break;
          case "experience":
            formattedSpot = "Experience Chamber";
            break;
          case "magic-stone":
            formattedSpot = "Magic Stone Chamber";
            break;
          default:
            break;
        }

        if (queueOfPlayer.length === 1 && queueOfPlayer[0].id === user.id) {
          let soloQueue = JSON.parse(
            fs.readFileSync(`./src/${place}/${findPlayer.floor}/${spot}`)
          );

          let soloAllPlayersQueue = JSON.parse(
            fs.readFileSync(`./src/players-on-queue.json`)
          );

          const newSoloQueue = soloQueue.shift();
          const filterSoloAllPlayersQueue = soloAllPlayersQueue.filter(
            (player) => player.id !== user.id
          );
          fs.writeFileSync(
            `./src/${place}/${findPlayer.floor}/${spot}`,
            JSON.stringify(soloQueue)
          );
          fs.writeFileSync(
            `./src/players-on-queue.json`,
            JSON.stringify(filterSoloAllPlayersQueue)
          );

          if (!playerInsideQueue.spot.name) {
            formattedSpot = translatePositionText(
              playerInsideQueue.spot.position
            );
            await interaction.reply(
              `:white_check_mark: <@${user.id}> você foi removido com sucesso da fila ${floor} ${formattedSpot}\n ------------------`
            );
            return;
          }

          await interaction.reply({
            content: `:white_check_mark: <@${
              user.id
            }> você foi removido com sucesso da fila ${floor} ${formattedSpot} ${
              playerInsideQueue.spot.position.charAt(0).toUpperCase() +
              playerInsideQueue.spot.position.slice(1)
            }!\n ------------------`,
          });

          return;
        }

        if (queueOfPlayer.length === 2 && queueOfPlayer[0].id === user.id) {
          let allPlayersteste = JSON.parse(
            fs.readFileSync(`./src/players-on-queue.json`)
          );
          let teste = JSON.parse(
            fs.readFileSync(`./src/${place}/${findPlayer.floor}/${spot}`)
          );
          const nextTickets = queueOfPlayer[1].spot.tickets;
          const nextFloor = queueOfPlayer[1].spot.floor;
          const nextChamberName = queueOfPlayer[1].spot.name;
          const nextChamberNumber = queueOfPlayer[1].spot.number;
          const nextPosition = queueOfPlayer[1].spot.position;
          const nextUserName = queueOfPlayer[1].userName;
          const nextUserId = queueOfPlayer[1].id;
          let nextStartedAt = date;
          let nextEndsAt = nextStartedAt;

          nextEndsAt = calcEndTime(nextTickets, nextStartedAt, nextEndsAt);

          const player = {
            userName: nextUserName,
            id: nextUserId,
            spot: {
              floor: nextFloor,
              name: nextChamberName,
              number: nextChamberNumber,
              position: nextPosition,
              tickets: nextTickets,
            },
            startedAt: nextStartedAt,
            endsAt: nextEndsAt,
          };

          teste = [];
          const newQueue = teste.push(player);
          const nextEndTime = nextEndsAt - nextStartedAt;

          const filterRemove = allPlayersteste.filter(
            (player) => player.id !== user.id
          );
          fs.writeFileSync(
            `./src/${place}/${findPlayer.floor}/${spot}`,
            JSON.stringify(teste)
          );
          fs.writeFileSync(
            `./src/players-on-queue.json`,
            JSON.stringify(filterRemove)
          );

          if (!playerInsideQueue.spot.name) {
            formattedSpot = translatePositionText(
              playerInsideQueue.spot.position
            );
            await channel.send(
              `:white_check_mark: <@${user.id}> você foi removido com sucesso da fila ${floor} ${formattedSpot}\n ------------------`
            );
          }

          await channel.send({
            content: `:white_check_mark: <@${
              user.id
            }> você foi removido com sucesso da fila ${floor} ${formattedSpot} ${
              playerInsideQueue.spot.position.charAt(0).toUpperCase() +
              playerInsideQueue.spot.position.slice(1)
            }!\n ------------------`,
          });

          //O timeout precisa retirar o proximo da fila no tempo certo(tanto na fila que ele esta tanto na players-on-queue), não retirar o proprio usuario do leave, tambem não pode usar a fila teste pois outra pessoa ja pode ter dado claim é necessario trabalhar em uma fila atualizada dentro do timeout ###RECADO PARA CODAR NA PROXIMA VEZ
          setTimeout(() => {
            let timeoutQueue = JSON.parse(
              fs.readFileSync(`./src/${place}/${floor}/${spot}`)
            );

            const findPlayer = timeoutQueue.find(
              (player) => player.id === nextUserId
            );

            let allPlayersTimeoutQueue = JSON.parse(
              fs.readFileSync(`./src/players-on-queue.json`)
            );

            if (!findPlayer) {
              return;
            }

            if (
              timeoutQueue.length === 2 &&
              timeoutQueue[1].id === nextUserId
            ) {
              return;
            }

            const timeoutFilterRemove = allPlayersTimeoutQueue.filter(
              (player) => player.id !== nextUserId
            );

            const newTimeoutQueue = timeoutQueue.shift();

            fs.writeFileSync(
              `./src/${place}/${floor}/${spot}`,
              JSON.stringify(timeoutQueue)
            );

            fs.writeFileSync(
              `./src/players-on-queue.json`,
              JSON.stringify(timeoutFilterRemove)
            );

            if (timeoutQueue.length === 0) {
              channel.send(
                `:warning: ATUALIZAÇÃO FILA :warning:\n\n :arrow_right: ${formattedSpot} ${nextChamberNumber} -- ${floor} -- ${
                  nextPosition.charAt(0).toUpperCase() + nextPosition.slice(1)
                } :arrow_left:\n\n Acabou a vez de <@${nextUserId}>, agora a fila esta vazia! :warning:\n ------------------`
              );
              return;
            } else {
              channel.send({
                content: `\n:ballot_box_with_check: <@${timeoutQueue[0].id}>, Você está liberado! Entre na Magic Square!\n ------------------`,
                ephemeral: true,
              });
              channel.send(
                `:warning: ATUALIZAÇÃO FILA :warning:\n\n :arrow_right: ${formattedSpot} ${nextChamberNumber} -- ${floor} -- ${
                  nextPosition.charAt(0).toUpperCase() + nextPosition.slice(1)
                }\n\n Acabou a vez de <@${nextUserId}>, a fila agora contem 1 pessoa:\n <@${
                  timeoutQueue[0].userName
                }>\n Começou em: ${moment
                  .tz(timeoutQueue[0].startedAt, "America/Sao_Paulo")
                  .format()
                  .slice(11, 16)} \n Acabara em: ${moment
                  .tz(timeoutQueue[0].endsAt, "America/Sao_Paulo")
                  .format()
                  .slice(11, 16)}!\n ------------------`
              );
            }
          }, nextEndTime);
        }
        if (queueOfPlayer.length === 2 && queueOfPlayer[1].id === user.id) {
          let queue = JSON.parse(
            fs.readFileSync(`./src/${place}/${findPlayer.floor}/${spot}`)
          );
          let allPlayersQueue = JSON.parse(
            fs.readFileSync(`./src/players-on-queue.json`)
          );

          const newQueue = queue.pop();
          const filterAllPlayersQueue = allPlayersQueue.filter(
            (player) => player.id !== user.id
          );

          fs.writeFileSync(
            `./src/${place}/${findPlayer.floor}/${spot}`,
            JSON.stringify(queue)
          );
          fs.writeFileSync(
            `./src/players-on-queue.json`,
            JSON.stringify(filterAllPlayersQueue)
          );

          if (!playerInsideQueue.spot.name) {
            formattedSpot = translatePositionText(
              playerInsideQueue.spot.position
            );
            await interaction.reply(
              `:white_check_mark: <@${user.id}> você foi removido com sucesso da fila ${floor} ${formattedSpot}\n ------------------`
            );
            return;
          }

          await interaction.reply({
            content: `:white_check_mark: <@${
              user.id
            }> você foi removido com sucesso da fila ${floor} ${formattedSpot} ${
              playerInsideQueue.spot.position.charAt(0).toUpperCase() +
              playerInsideQueue.spot.position.slice(1)
            }!\n ------------------`,
          });

          return;
        }
      };
      removeFromQueue();
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
