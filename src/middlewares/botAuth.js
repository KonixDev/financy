const User = require('../models/User'); // Asegúrate de que la ruta al modelo de usuario sea correcta
const checkIfRegistered = async (chatId, bot) => {
  try {
    const user = await User.findOne({ telegramId: chatId }); // Usamos chatId como identificador único

    if (!user) {
      await bot.sendMessage(chatId, "No estás registrado. Por favor, regístrate para usar esta función.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al verificar si el usuario está registrado:", error);
    await bot.sendMessage(chatId, "Ocurrió un error. Por favor, intenta de nuevo más tarde.");
    return false;
  }
};

const verifyTokenExpiration = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Verificar si el token ha expirado
    if (Date.now() > user.tokenExpires) {
      return res.status(401).json({ msg: "Token expirado. Por favor, vuelve a iniciar sesión." });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

module.exports = {checkIfRegistered, verifyTokenExpiration};

