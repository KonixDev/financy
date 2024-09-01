
const MONTHS = {
    "01": 'Enero',
    "02": 'Febrero',
    "03": 'Marzo',
    "04": 'Abril',
    "05": 'Mayo',
    "06": 'Junio',
    "07": 'Julio',
    "08": 'Agosto',
    "09": 'Septiembre',
    "10": 'Octubre',
    "11": 'Noviembre',
    "12": 'Diciembre',
};

function getMesName(mes) {
  return MONTHS[mes.split("-")[1]] || "Mes no encontrado";
}

module.exports = {
  getMesName,
};