module.exports = {
  name: "fiveMinutesMessage",
  once: true,
  execute(channel, text) {
    channel.send(text);
  },
};
