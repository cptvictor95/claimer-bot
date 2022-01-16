const { SlashCommandBuilder } = require("@discordjs/builders");
const { channel } = require("diagnostics_channel");
const fs = require("fs");
const { calcEndTime } = require("../utils/calcEndTime");
const { translatePositionText } = require("../utils/translatePositionText");
const moment = require("moment-timezone");

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
            formattedSpot = `Gold Chamber ${playerInsideQueue.spot.number}`;
            break;
          case "experience":
            formattedSpot = `Experience Chamber ${playerInsideQueue.spot.number}`;
            break;
          case "magic-stone":
            formattedSpot = `Magic Stone Chamber ${playerInsideQueue.spot.number}`;
            break;
          default:
            break;
        }
        //Opções quando um usuario utiliza o comando
        //--Nao estar em nenhuma fila(Enviar mensagem de aviso alertando o usuario)
        //--Estar sozinho na fila(Segue o padrão de retirar das duas filas e enviar a mensagem)
        //--Estar em primeiro da fila e com uma pessoa atras(Se isso ocorrer, a pessoa que esta atras esta a apenas 5 minutos ou menos de dif)
        //--Estar em segundo da fila e com uma pessoa a frente(Se isso ocorrer, a pessoa da frente não é afetada e o /leave segue o padrão)

        //[X]FUNCIONANDO E TESTADO 14/01
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
              `:white_check_mark: <@${user.id}> você foi removido com sucesso da fila ${formattedSpot} -- ${floor}\n ------------------`
            );
            return;
          }

          await interaction.reply({
            content: `:white_check_mark: <@${
              user.id
            }> você foi removido com sucesso da fila ${formattedSpot} -- ${floor} -- ${
              playerInsideQueue.spot.position.charAt(0).toUpperCase() +
              playerInsideQueue.spot.position.slice(1)
            }!\n ------------------`,
          });

          return;
        }

        //Retirar o usuario da fila
        //Reescrever o endsAt e startedAt do proximo da fila
        //Alem de reescrever fazer um timeout para retirar o proximo da fila e da all players-queue
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

          await interaction.reply(
            `:white_check_mark: <@${
              user.id
            }> você foi removido com sucesso da fila ${formattedSpot} -- ${floor} -- ${
              nextPosition.charAt(0).toUpperCase() + nextPosition.slice(1)
            }\n ------------------`
          );
          await channel.send({
            content: `\n:ballot_box_with_check: O player que estava farmando saiu mais cedo! <@${teste[0].id}> Você já pode entrar na Magic Square!\n ------------------`,
          });
          await channel.send(
            `:warning: ATUALIZAÇÃO FILA :warning:\n\n :arrow_right: ${formattedSpot} -- ${floor} -- ${
              nextPosition.charAt(0).toUpperCase() + nextPosition.slice(1)
            }\n\nAcabou a vez de <@${
              user.id
            }>, a fila agora contem 1 pessoa:\n${
              teste[0].userName
            }\nComeçou em: ${moment
              .tz(teste[0].startedAt, "America/Sao_Paulo")
              .format()
              .slice(11, 16)} \n Acabara em: ${moment
              .tz(teste[0].endsAt, "America/Sao_Paulo")
              .format()
              .slice(11, 16)}!\n ------------------`
          );

          //O timeout precisa retirar o proximo da fila no tempo certo(tanto na fila que ele esta tanto na players-on-queue), não retirar o proprio usuario do leave, tambem não pode usar a fila teste pois outra pessoa ja pode ter dado claim é necessario trabalhar em uma fila atualizada dentro do timeout ###RECADO PARA CODAR NA PROXIMA VEZ
          setTimeout(() => {
            let timeoutQueue = JSON.parse(
              fs.readFileSync(`./src/${place}/${floor}/${spot}`)
            );
            const findPlayer = timeoutQueue.find(
              (player) => player.id === timeoutQueue[0].id
            );

            let allPlayersTimeoutQueue = JSON.parse(
              fs.readFileSync(`./src/players-on-queue.json`)
            );

            if (!findPlayer) {
              return;
            }

            if (
              timeoutQueue.length === 2 &&
              timeoutQueue[0].id !== nextUserId
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
                `:warning: ATUALIZAÇÃO FILA :warning:\n\n :arrow_right: ${formattedSpot} ${floor} ${
                  nextPosition.charAt(0).toUpperCase() + nextPosition.slice(1)
                } :arrow_left:\n\nAcabou a vez de <@${nextUserId}>, agora a fila esta vazia! :warning:\n ------------------`
              );
              return;
            } else {
              channel.send({
                content: `\n:ballot_box_with_check: <@${timeoutQueue[0].id}>, Você está liberado! Entre na Magic Square!\n ------------------`,
              });
              channel.send(
                `:warning: ATUALIZAÇÃO FILA :warning:\n\n :arrow_right: ${formattedSpot} ${floor} ${
                  nextPosition.charAt(0).toUpperCase() + nextPosition.slice(1)
                }\n\nAcabou a vez de <@${nextUserId}>, a fila agora contem 1 pessoa:\n${
                  timeoutQueue[0].userName
                }\nComeçou em: ${moment
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
        //[X]FUNCIONANDO E TESTADO 14/01
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
