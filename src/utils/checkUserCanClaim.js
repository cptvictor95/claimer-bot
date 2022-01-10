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
        `\n:no_entry_sign: <@${user.id}> Você não pode claimar aqui! Faltam mais de 25 minutos para acabar o tempo da pessoa que esta farmando! :no_entry_sign:`
      );
      return false;
    }

    const hasNoRole = !isTierOne && !isTierTwo && !isTierThree;

    if (hasNoRole) {
      return false;
    }

    if (date >= queue[0].endsAt - 300000 && isTierOne) {
      return true;
    }
    if (date <= queue[0].endsAt - 900000 && isTierOne) {
      return false;
    }
    if (date >= queue[0].endsAt - 900000 && isTierTwo) {
      return true;
    }

    if (date >= queue[0].endsAt - 1500000 && isTierThree) {
      return true;
    } else {
      return false;
    }
  },
};
