const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    // Crear nuevo usuario
    user = new User({
      name: username,
      email,
      password,
    });

    // Hashear la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Crear y devolver un token JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Guardar el token y su fecha de expiración
    user.token = token;
    user.tokenExpires = Date.now() + 3600000; // 1 hora en milisegundos

    await user.save();

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    // Comparar la contraseña ingresada con la almacenada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    // Crear y devolver un token JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Actualizar el token y su fecha de expiración
    user.token = token;
    user.tokenExpires = Date.now() + 3600000; // 1 hora en milisegundos

    await user.save();

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
