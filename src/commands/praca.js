const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { calcEndTime } = require("../utils/calcEndTime");
const moment = require("moment-timezone");
const { verifyWritePlayer } = require("../utils/verifyWritePlayer");
const { formatTicketsTime } = require("../utils/formatTicketsTime");
const { handleGhostPlayer } = require("../utils/handleGhostPlayer");
const guildId =
  process.env.NODE_ENV === "dev"
    ? process.env.DEV_GUILD_ID
    : process.env.PROD_GUILD_ID;

/* --[X]Deve colocar o usuario na fila 
   --[X]Certificar que o claim não pode ser realizado antes dos 5min do prox acabar
   --[X]Certificar que o usuario ja não esta em algum fila
   --[X]Certificar a fila ja não esta cheia
   --[X]Certificar que o horario é calculado certo dependendo da posição do usuario
   --[X]Certificar que o tempo de saida corresponde ao tempo certo baseado na posição do usuario
   --[X]Certificar o envio da mensagem e seu conteudo formatado e correto
   --[X]Certificar que o envio da mensagem esta baseado na posição de quem realizou o claim
   --[X]Certificar que quando o usuario que deu claim for tirado da fila a mensagem certa baseado em como esta a fila
   -----[X]Se a fila esta vazia
   -----[X]Se a fila tem mais uma pessoa
 */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("praca")
    .setDescription(
      "Reivindica uma sala na Magic Square baseado no andar, nome e número da chamber e tickets"
    )
    .addStringOption((option) =>
      option
        .setName("floor")
        .setDescription("Número do Floor (1F-6F)")
        .setRequired(true)
        .addChoice("1F", "1F")
        .addChoice("2F", "2F")
        .addChoice("3F", "3F")
        .addChoice("4F", "4F")
        .addChoice("5F", "5F")
        .addChoice("6F", "6F")
        .addChoice("7F", "7F")
    )
    .addStringOption((option) =>
      option
        .setName("chambername")
        .setDescription("Nome da Chamber (Gold/Experience/Magic Stone)")
        .setRequired(true)
        .addChoice("Gold Chamber", "gold")
        .addChoice("Experience Chamber", "experience")
        .addChoice("Magic Stone Chamber", "magic-stone")
    )
    .addStringOption((option) =>
      option
        .setName("chambernumber")
        .setDescription("Número da Chamber (I/II/III)")
        .setRequired(true)
        .addChoice("Chamber I", "1")
        .addChoice("Chamber II", "2")
        .addChoice("Chamber III", "3")
    )
    .addStringOption((option) =>
      option
        .setName("tickets")
        .setDescription("Número de tickets: 1 or 2")
        .setRequired(true)
        .addChoice("1", "30")
        .addChoice("2", "60")
        .addChoice("3", "90")
        .addChoice("4", "120")
        .addChoice("5", "150")
        .addChoice("6", "180")
        .addChoice("7", "210")
        .addChoice("8", "240")
        .addChoice("9", "270")
        .addChoice("10", "300")
        .addChoice("11", "330")
        .addChoice("12", "360")
        .addChoice("13", "390")
        .addChoice("14", "420")
        .addChoice("15", "450")
        .addChoice("16", "480")
    )
    .addStringOption((option) =>
      option
        .setName("position")
        .setDescription("Escolhe entre a chamber do Meio Esquerda ou Direita")
        .setRequired(true)
        .addChoice("Esquerda", "left")
        .addChoice("Meio", "middle")
        .addChoice("Direita", "right")
    ),
  async execute(interaction) {
    try {
      if (!interaction.isCommand) return;
      if (interaction.commandName === "praca");

      const date = Date.now();
      const floor = interaction.options.getString("floor");
      const chamberName = interaction.options.getString("chambername");
      const chamberNumber = interaction.options.getString("chambernumber");
      const tickets = interaction.options.getString("tickets");
      const position = interaction.options.getString("position");
      const client = interaction.client;
      const guild = client.guilds.cache.get(guildId);
      const channel = interaction.channel;
      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );
      const userRoles = interaction.member.roles.cache.map((role) => role.name);
      const hasClaimManager = userRoles.includes("claim manager");
      const formattedChamber = `${chamberName}-${chamberNumber}-${position}.json`; //Tirar o .json
      const queueString = `./src/magic-square/${floor}/${formattedChamber}`;

      let allPlayersQueue = JSON.parse(
        fs.readFileSync("./src/players-on-queue.json")
      );
      let startedAt = date;
      let endsAt = startedAt;
      let queue;
      queue = JSON.parse(
        fs.readFileSync(`./src/magic-square/${floor}/${formattedChamber}`)
      );

      //Verificações como se o comando foi usado no canal certo, se a pessoa ja não esta na fila e etc...

      if (!channel.name.includes(`${floor.toLowerCase()}-claim-praca`)) {
        await interaction.reply({
          content: `:no_entry_sign: <@${user.id}> é necessario dar claim na sala certa :no_entry_sign:`,
          ephemeral: true,
        });
        return;
      }

      const findPlayer = allPlayersQueue.find(
        (player) => player.id === user.id
      );

      if (findPlayer && !hasClaimManager) {
        await interaction.reply({
          content: `:no_entry_sign: <@${user.id}> você já esta numa fila!`,
          ephemeral: true,
        });
        return;
      }

      //Verifica se o bot falhou e nao retirou os dois usuario na hora certa, depois disso retira os usuarios do JSON e let para seguir os calculos(TRANSOFORMAR EM UMA FUNÇÃO UNICA)

      const formattedValues = handleGhostPlayer(
        queue,
        allPlayersQueue,
        queueString,
        date
      );
      queue = formattedValues.queue;
      allPlayersQueue = formattedValues.allPlayersQueue;

      //-----//

      if (queue.length >= 2) {
        await interaction.reply({
          content: `\n:no_entry_sign: <@${user.id}> essa fila está cheia! :no_entry_sign:`,
          ephemeral: true,
        });
        return;
      }

      if (
        queue.length > 0 &&
        date <= Number(queue[0].endsAt) - 300000 &&
        !hasClaimManager
      ) {
        await interaction.reply({
          content: `\n:no_entry_sign: <@${user.id}> Você ainda não pode dar claim aqui, deve faltar 5 minutos para acabar a vez do player que esta farmando no momento. :no_entry_sign:`,
          ephemeral: true,
        });
        return;
      }
      //-----//

      //Calcula o tempo que deve começar a vez do usuario que deu claim e seu horario de termino, alem de formatar algumas datas para ser mostrada ao usuario
      if (queue.length == 1) {
        const endsAt01 = queue[0].endsAt;
        startedAt = endsAt01;
      }

      endsAt = calcEndTime(tickets, startedAt);

      let {
        formattedTicket = formattedTicket,
        formattedDate = formattedDate,
        ticketsHoursCalc = ticketsHoursCalc,
        minutes = minutes,
        hours = hours,
        timeToEnter = timeToEnter,
      } = formatTicketsTime(startedAt, endsAt, date);
      //-----//

      //Cria os objetos baseado no player que vai para as 2 queues
      const player = {
        userName: interaction.user.username,
        id: user.id,
        spot: {
          floor: floor,
          name: chamberName,
          number: chamberNumber,
          position: position,
          tickets: tickets,
        },
        startedAt: startedAt,
        endsAt: endsAt,
      };

      const playerForAllPlayersQueue = {
        place: "magic-square",
        id: user.id,
        floor: floor,
        spot: formattedChamber,
      };
      //-----//

      //Coloca o player na fila e coloca a nova fila nos dois arquivos JSON
      const pushPlayer = queue.push(player);

      fs.writeFileSync(
        `./src/magic-square/${floor}/${formattedChamber}`,
        JSON.stringify(queue)
      );

      const pushAllPlayersQueue = allPlayersQueue.push(
        playerForAllPlayersQueue
      );

      fs.writeFileSync(
        `./src/players-on-queue.json`,
        JSON.stringify(allPlayersQueue)
      );
      //-----//

      //Realiza um teste unitario na função de colocar o player nas 2 filas, volta 3 opções sendo uma false (nao entrou em nenhuma), true(entrou em todas), partially(entrou em uma)
      const verifyJsonWrite = verifyWritePlayer(user.id, queueString);

      if (verifyJsonWrite === "false") {
        await interaction.reply(
          `:warning: <@${user.id}> Um erro inesperado aconteceu e seu claim não foi efetivado, por favor refaça o claim!`
        );

        return;
      }
      if (verifyJsonWrite === "partially") {
        await interaction.reply(
          `:warning: <@${user.id}> Um erro inesperado aconteceu e seu claim não foi efetivado, por favor refaça o claim!`
        );

        const verifyAllPlayersQueue = allPlayersQueue.find(
          (player) => player.id
        );
        const verifyQueue = queue.find((player) => player.id);

        if (verifyAllPlayersQueue !== undefined) {
          const filteredVerify = allPlayersQueue.filter(
            (player) => player.id !== user.id
          );

          fs.writeFileSync(
            `./src/players-on-queue.json`,
            JSON.stringify(filteredVerify)
          );
        }

        if (verifyQueue !== undefined) {
          const filteredQueueVerify = queue.filter(
            (player) => player.id !== user.id
          );

          fs.writeFileSync(
            `./src/magic-square/${floor}/${formattedChamber}`,
            JSON.stringify(filteredQueueVerify)
          );
        }

        return;
      }

      console.log(
        `${user.id} após ser colocado na all players`,
        allPlayersQueue
      );
      console.log(`${user.id} após ser colocado na queue`, queue);
      //-----//

      const queueExit = endsAt - date;

      //Começa a enviar as mensagens de acordo com a situação da fila e tambem os tickets e tempo restante para entrar.

      if (queue.length === 1 && queue[0].id === user.id) {
        if (ticketsHoursCalc > 0) {
          await interaction.reply({
            content: `\n:white_check_mark: <@${user.id}> pegou o spot ${
              chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
            } ${chamberNumber} ${
              position.charAt(0).toUpperCase() + position.slice(1)
            } no ${floor} por ${formattedTicket.slice(0, 5)} horas   
            \n:ballot_box_with_check: ${
              interaction.user.username
            } você já pode entrar na Magic Square!\n ------------------`,
          });
        } else {
          await interaction.reply({
            content: `:white_check_mark: <@${user.id}> pegou o spot ${
              chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
            } ${chamberNumber} ${
              position.charAt(0).toUpperCase() + position.slice(1)
            } no ${floor} por ${formattedTicket.slice(3, 8)} minutos   
          \n:ballot_box_with_check: ${
            interaction.user.username
          } você já pode entrar na Magic Square!\n ------------------`,
          });
        }
      }

      if (queue.length > 1 && queue[1].id === user.id) {
        let result = timeToEnter - 300000;
        if (minutes + hours > 0) {
          if (ticketsHoursCalc > 0) {
            await interaction.reply({
              content: `:white_check_mark: <@${user.id}> pegou o spot ${
                position.charAt
              }${
                chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
              } ${chamberNumber} ${position
                .charAt(0)
                .toUpperCase()} no ${floor} por ${formattedTicket.slice(
                0,
                5
              )} horas   
              \n:stopwatch: Sua vez é em ${formattedDate.slice(
                3,
                8
              )} minutos, esteja pronto!\n ------------------`,
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: `:white_check_mark: <@${user.id}> pegou o spot ${
                chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
              } ${chamberNumber} ${position
                .charAt(0)
                .toUpperCase()} no ${floor} por ${formattedTicket.slice(
                3,
                8
              )} minutos   
              \n:stopwatch: Sua vez é em ${formattedDate.slice(
                3,
                8
              )} minutos, esteja pronto!\n ------------------`,
              ephemeral: true,
            });
          }
          setTimeout(() => {
            const attQueue = JSON.parse(
              fs.readFileSync(`./src/players-on-queue.json`)
            );

            const checkPlayer = attQueue.find(
              (player) => player.id === user.id
            );

            if (checkPlayer) {
              channel.send({
                content: `\n:rotating_light: <@${user.id}>, esteja pronto! Em 5 minutos você poderá entrar na Magic Square!\n ------------------`,
                ephemeral: true,
              });
            }
          }, result);
        } else {
          if (ticketsHoursCalc > 0) {
            await interaction.reply({
              content: `:white_check_mark: <@${user.id}> pegou o spot ${
                chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
              } ${chamberNumber} ${position
                .charAt(0)
                .toUpperCase()} no ${floor} por ${formattedTicket.slice(
                0,
                5
              )} horas   
              \n:stopwatch: Sua vez é em ${formattedDate.slice(
                3,
                8
              )} segundos, esteja pronto!\n ------------------`,
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: `:white_check_mark: <@${user.id}> pegou o spot ${
                chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
              } ${chamberNumber} ${position
                .charAt(0)
                .toUpperCase()} no ${floor} por ${formattedTicket.slice(
                3,
                8
              )} minutos   
              \n:stopwatch: Sua vez é em ${formattedDate.slice(
                3,
                8
              )} segundos, esteja pronto!\n ------------------`,
              ephemeral: true,
            });
          }

          setTimeout(() => {
            const secondAttQueue = JSON.parse(
              fs.readFileSync(`./src/players-on-queue.json`)
            );
            const secondCheckPlayer = secondAttQueue.find(
              (player) => player.id === user.id
            );
            if (secondCheckPlayer) {
              channel.send({
                content: `\n:rotating_light: <@${user.id}>, esteja pronto! Em 5 minutos você poderá entrar na Magic Square!\n ------------------`,
                ephemeral: true,
              });
            }
          }, result);
        }
      }
      //-----//

      //Timeout para retirar a pessoa da fila, começando com testes para verificar se a pessoa nao saiu da fila ou alterou seu ticket, depois remove o player e manda a mensagem
      setTimeout(() => {
        const timeoutDate = Date.now();

        let allPlayersQueueTimeout = JSON.parse(
          fs.readFileSync("./src/players-on-queue.json")
        );

        const check = allPlayersQueueTimeout.find(
          (player) => player.id === user.id
        );

        let timeoutQueue = JSON.parse(
          fs.readFileSync(`./src/magic-square/${floor}/${formattedChamber}`)
        );

        if (!check) {
          return;
        }

        if (timeoutQueue.length === 0) {
          return;
        }

        if (timeoutQueue[0].id !== user.id) {
          return;
        }

        if (timeoutDate < timeoutQueue[0].endsAt) {
          return;
        }
        //-----------//

        //Tentar tirar as variaveis na hora de mudar uma LET
        const newTimeoutQueue = timeoutQueue.shift();
        //-----------//

        fs.writeFileSync(
          `./src/magic-square/${floor}/${formattedChamber}`,
          JSON.stringify(timeoutQueue)
        );

        const filteredAllPlayersQueue = allPlayersQueueTimeout.filter(
          (player) => player.id !== user.id
        );

        fs.writeFileSync(
          `./src/players-on-queue.json`,
          JSON.stringify(filteredAllPlayersQueue)
        );

        if (timeoutQueue.length === 0) {
          channel.send(
            `:warning: ATUALIZAÇÃO FILA :warning:\n\n :arrow_right: ${
              chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
            } ${chamberNumber} -- ${floor} -- ${
              position.charAt(0).toUpperCase() + position.slice(1)
            } :arrow_left:\n\n Acabou a vez de <@${
              user.id
            }>, agora a fila esta vazia! :warning:\n ------------------`
          );
          return;
        } else {
          channel.send({
            content: `\n:ballot_box_with_check: <@${timeoutQueue[0].id}>, Você está liberado! Entre na Magic Square!\n ------------------`,
            ephemeral: true,
          });
          channel.send(
            `:warning: ATUALIZAÇÃO FILA :warning:\n\n :arrow_right: ${
              chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
            } ${chamberNumber} -- ${floor} -- ${
              position.charAt(0).toUpperCase() + position.slice(1)
            }\n\n Acabou a vez de <@${
              user.id
            }>, a fila agora contem 1 pessoa:\n <@${
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
      }, queueExit);
      //-----//
    } catch (error) {
      await interaction.reply({
        content: `Um erro aconteceu ao executar esse comando, por favor verifique com a staff.\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
