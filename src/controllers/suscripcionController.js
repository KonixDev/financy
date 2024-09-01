const Suscripcion = require('../models/Suscripcion');

exports.createSuscripcion = async (req, res) => {
  const { name, amount, frequency, nextPaymentDate } = req.body;

  try {
    const suscripcion = new Suscripcion({
      user: req.user.id,
      name,
      amount,
      frequency,
      nextPaymentDate,
    });

    const savedSuscripcion = await suscripcion.save();
    res.json(savedSuscripcion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};
