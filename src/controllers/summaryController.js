const SummaryService = require('../services/summaryService');

exports.getSummary = async (req, res) => {
  try {
    const summaryData = await SummaryService.generateSummary(req.user.id);
    res.json(summaryData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.getGastosPorCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const gastosPorDia = await SummaryService.getLastMonthSummaryByCategory(req.user.id, categoriaId);
    res.json(gastosPorDia);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};