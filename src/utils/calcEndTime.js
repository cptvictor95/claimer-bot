module.exports = {
  calcEndTime: function (tickets, startedAt) {
    switch (tickets) {
      case "30":
        endsAt = startedAt + 1800000;
        break;
      case "60":
        endsAt = startedAt + 3600000;
        break;
      case "90":
        endsAt = startedAt + 5400000;
        break;
      case "120":
        endsAt = startedAt + 7200000;
        break;
      case "150":
        endsAt = startedAt + 9000000;
        break;
      case "180":
        endsAt = startedAt + 10800000;
        break;
      case "210":
        endsAt = startedAt + 12600000;
        break;
      case "240":
        endsAt = startedAt + 14400000;
        break;
      case "270":
        endsAt = startedAt + 16200000;
        break;
      case "300":
        endsAt = startedAt + 18000000;
        break;
      case "330":
        endsAt = startedAt + 19800000;
        break;
      case "360":
        endsAt = startedAt + 21600000;
        break;
      case "390":
        endsAt = startedAt + 23400000;
        break;
      case "420":
        endsAt = startedAt + 25200000;
        break;
      case "450":
        endsAt = startedAt + 27000000;
        break;
      case "480":
        endsAt = startedAt + 28800000;
        break;

      default:
        break;
    }
  },
};
