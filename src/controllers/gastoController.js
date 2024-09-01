// controllers/gastoController.js
const GastoService = require('../services/gastoService');
const { Parser } = require('json2csv');

exports.createGasto = async (req, res) => {
  try {
    const gastoData = {
      user: req.user.id,
      amount: req.body.amount,
      category: req.body.category,
      isRecurring: req.body.isRecurring,
      recurringFrequency: req.body.recurringFrequency,
      date: req.body.date || Date.now(),
    };

    const savedGasto = await GastoService.createGasto(gastoData);
    res.json(savedGasto);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.getGastos = async (req, res) => {
  try {
    const gastos = await GastoService.getGastos(req.user.id);
    res.json(gastos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateGasto = async (req, res) => {
  try {
    const updatedGasto = await GastoService.updateGasto(req.params.id, req.body, req.user.id);
    res.json(updatedGasto);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'No autorizado' || err.message === 'Gasto no encontrado') {
      res.status(404).json({ msg: err.message });
    } else {
      res.status(500).send('Error en el servidor');
    }
  }
};

exports.deleteGasto = async (req, res) => {
  try {
    await GastoService.deleteGasto(req.params.id, req.user.id);
    res.json({ msg: 'Gasto eliminado' });
  } catch (err) {
    console.error(err.message);
    if (err.message === 'No autorizado' || err.message === 'Gasto no encontrado') {
      res.status(404).json({ msg: err.message });
    } else {
      res.status(500).send('Error en el servidor');
    }
  }
};

exports.exportGastosCSV = async (req, res) => {
  try {
    const gastos = await GastoService.getGastos(req.user.id);
    const fields = ['amount', 'category', 'date'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(gastos);
    res.header('Content-Type', 'text/csv');
    res.attachment('gastos.csv');
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};
