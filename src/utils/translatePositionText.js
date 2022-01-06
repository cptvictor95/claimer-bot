module.exports = {
  translatePositionText: function (position) {
    switch (position) {
      case "upper-north":
        formattedPosition = "Cima Norte";
        break;
      case "upper-south":
        formattedPosition = "Cima Sul";

        break;
      case "down-left":
        formattedPosition = "Baixo Esquerda";
        break;
      case "down-right":
        formattedPosition = "Baixo Direita";
        break;

      default:
        break;
    }
  },
};

module.exports = translatePositionText;
