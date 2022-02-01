module.exports = {
  formatTicketsTime: function (startedAt, endsAt, date) {
    timeToEnter = startedAt - date;
    ticketsInMs = endsAt - startedAt;
    minuteTimeToEnter = timeToEnter / 60000;
    seconds = Math.floor(timeToEnter / 1000) % 60;
    minutes = Math.floor((timeToEnter / (1000 * 60)) % 60);
    hours = Math.floor((timeToEnter / (1000 * 60 * 60)) % 24);
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    let ticketsSecCalc = Math.floor(ticketsInMs / 1000) % 60;
    let ticketsMinCalc = Math.floor((ticketsInMs / (1000 * 60)) % 60);
    let ticketsHoursCalc = Math.floor((ticketsInMs / (1000 * 60 * 60)) % 24);
    ticketsHoursCalc =
      ticketsHoursCalc < 10 ? "0" + ticketsHoursCalc : ticketsHoursCalc;
    ticketsMinCalc =
      ticketsMinCalc < 10 ? "0" + ticketsMinCalc : ticketsMinCalc;
    ticketsSecCalc =
      ticketsSecCalc < 10 ? "0" + ticketsSecCalc : ticketsSecCalc;
    formattedDate = hours + ":" + minutes + ":" + seconds;
    formattedTicket =
      ticketsHoursCalc + ":" + ticketsMinCalc + ":" + ticketsSecCalc;

    return {
      formattedTicket,
      formattedDate,
      ticketsHoursCalc,
      minutes,
      hours,
      timeToEnter,
    };
  },
};
