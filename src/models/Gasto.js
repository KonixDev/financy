const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GastoSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true }, // Referencia a Categoria
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: { type: String }, // Ej. 'mensual', 'diario', 'semanal'
  date: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model('Gasto', GastoSchema);