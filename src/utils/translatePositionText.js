module.exports = {
  translatePositionText: function (position) {
    switch (position) {
      case "upper-north":
        return "Cima Norte";
      case "upper-south":
        return "Cima Sul";
      case "down-left":
        return "Baixo Esquerda";
      case "down-right":
        return "Baixo Direita";
      default:
        break;
    }
  },
};
