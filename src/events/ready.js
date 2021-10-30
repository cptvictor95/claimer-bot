module.exports = {
  name: "ready",
  one: true,
  execute(client) {
    console.log(`Claimer Bot is online!\nBot tag: ${client.user.tag}`);
  },
};
