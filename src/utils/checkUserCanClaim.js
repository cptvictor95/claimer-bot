module.exports = {
  checkUserCanClaim: async function (
    date,
    queue,
    isTierOne,
    isTierTwo,
    isTierThree,
    interaction,
    user
  ) {
    if (queue.length === 0) return true;
    if (date <= queue[0].endsAt - 1500000) {
      await interaction.reply(
        `\n:no_entry_sign: <@${user.id}> Você ainda não pode dar claim aqui. :no_entry_sign:`
      );
      return false;
    }

    const hasNoRole = !isTierOne && !isTierTwo && !isTierThree;

    if (hasNoRole) {
      await interaction.reply({
        content: `\n:no_entry_sign: <@${user.id}> Você não pode dar claim pois não possui nenhum cargo. Entre em contato com a staff. :no_entry_sign:`,
        ephemeral: true,
      });

      return false;
    }

    if (date >= queue[0].endsAt - 300000 && isTierOne) {
      return true;
    }

    if (date >= queue[0].endsAt - 900000 && isTierTwo) {
      return true;
    }

    if (date >= queue[0].endsAt - 1500000 && isTierThree) {
      return true;
    }
  },
};
