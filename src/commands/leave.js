const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Sai da fila que estava"),
  async execute(interaction) {
    try {
      const client = interaction.client;
      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );
      const queue = JSON.parse(
        fs.readFileSync("./src/magic-square/players-on-queue.json")
      );
      if (queue.length === 0) return;

      const removeFromQueue = async () => {
        const findPlayer = queue.find((player) => player.id === user.id);
        const allPlayersQueueIds = queue.map((player) => player.id);

        if (!findPlayer) {
          await interaction.reply(
            `:no_entry_sign: <@${user.id}> você não está em nenhuma fila! :no_entry_sign:`
          );
          return;
        }

        queueOfPlayer = JSON.parse(
          fs.readFileSync(
            `./src/magic-square/${findPlayer.floor}/${findPlayer.spot}`
          )
        );

        const arrayOfPlayersId = queueOfPlayer.map((player) => player.id);
        const playerIndex = arrayOfPlayersId.indexOf(`${findPlayer.id}`);
        const newQueue = queueOfPlayer.splice(playerIndex, 1);

        const indexOffAllPlayersQueue = allPlayersQueueIds.indexOf(
          `${user.id}`
        );
        const newAllPlayersQueue = queue.splice(indexOffAllPlayersQueue, 1);

        fs.writeFileSync(
          `./src/magic-square/${findPlayer.floor}/${findPlayer.spot}`,
          JSON.stringify(queueOfPlayer)
        );
        fs.writeFileSync(
          `./src/magic-square/players-on-queue.json`,
          JSON.stringify(queue)
        );

        await interaction.reply(
          `:white_check_mark: <@${user.id}> você foi removido com sucesso da fila que estava!`
        );
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
