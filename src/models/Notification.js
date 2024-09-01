// models/Notification.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["text", "summary", "both"], required: true }, // Tipo de notificación
  message: { type: String, required: true }, // Mensaje de la notificación
  intervals: [{ type: String, required: true }], // Horarios específicos (e.g., ["09:00", "12:00", "18:00"])
  active: { type: Boolean, default: true }, // Estado de la notificación
  startDate: { type: Date, default: Date.now }, // Fecha de inicio
  endDate: { type: Date }, // Fecha de fin, si aplica
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    required: true,
  }, // Frecuencia
});

module.exports = mongoose.model("Notification", NotificationSchema);
