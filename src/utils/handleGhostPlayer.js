const fs = require("fs");

module.exports = {
  handleGhostPlayer: function (queue, allPlayersQueue, queueString, date) {
    // if (
    //   queue.length === 2 &&
    //   Number(queue[0].endsAt) < date &&
    //   Number(queue[1].endsAt) < date
    // ) {
    //   const filterFirstErrorPlayer = allPlayersQueue.filter(
    //     (player) => player.id !== queue[0].id
    //   );

    //   const filterSecondErrorPlayer = filterFirstErrorPlayer.filter(
    //     (player) => player.id !== queue[1].id
    //   );

    //   queue = [];

    //   fs.writeFileSync(queueString, JSON.stringify(queue));

    //   fs.writeFileSync(
    //     "./src/players-on-queue.json",
    //     JSON.stringify(filterSecondErrorPlayer)
    //   );

    //   allPlayersQueue = filterSecondErrorPlayer;
    // }

    if (queue.length > 0 && queue[0].endsAt < date) {
      const filteredErrorPlayer = allPlayersQueue.filter(
        (player) => player.id !== queue[0].id
      );
      allPlayersQueue = filteredErrorPlayer;
      const changeQueue = queue.shift();
      fs.writeFileSync(queueString, JSON.stringify(queue));
      fs.writeFileSync(
        "./src/players-on-queue.json",
        JSON.stringify(filteredErrorPlayer)
      );
    }
    return {
      queue,
      allPlayersQueue,
    };
  },
};
