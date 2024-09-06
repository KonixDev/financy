const { formatCurrency, CURRENCYS_OPTIONS } = require("../utils/currencyUtil");

exports.MESSAGES = {
  WELCOME: "¡Bienvenido a FinanzasBot! Selecciona una opción:",
  ENTER_NAME: "Por favor, ingresa tu nombre:",
  ENTER_EMAIL: "Ahora ingresa tu correo electrónico:",
  ENTER_PASSWORD: "Por favor, ingresa una contraseña:",
  REGISTRATION_COMPLETE: "¡Registro completado! Ahora puedes usar el bot.",
  ALREADY_REGISTERED: "Ya estás registrado. Usa el menú para ver las opciones.",
  NOT_REGISTERED: "No estás registrado. Usa el botón de registro.",
  LOGIN_SUCCESS: (name) =>
    `¡Bienvenido de vuelta, ${name}! Tu token de acceso se ha actualizado.`,
  MENU_PROMPT: "Selecciona una opción:",
  BACK_TO_MENU: "Regresar al menú principal",
  INVALID_AMOUNT: "Por favor, ingresa un monto válido.",
  IS_RECURRING: "¿Es un gasto recurrente?",
  EMPTY_CATEGORY_NAME:
    "El nombre de la categoría no puede estar vacío. Por favor, ingresa un nombre válido.",
  CATEGORY_CREATED: (name) => `¡Categoría "${name}" creada exitosamente!`,
  EMAIL_EXISTS:
    "Este correo ya está registrado. Intenta con otro correo o usa el botón de inicio de sesión.",
  INVALID_EMAIL: "Por favor, ingresa un correo electrónico válido.",
  ENTER__SPEND_AMOUNT: "Por favor, ingresa el monto del gasto:",
  ENTER_CATEGORY_NAME: "Por favor, ingresa el nombre de la categoría:",
  GASTO_REGISTERED: (spentAmount, category, totalSpent) =>
    `Gasto de $${spentAmount} en "${category}" registrado. Total gastado en el último mes para la categoría: ${totalSpent}.`,
  SELECT_CATEGORY: "Selecciona una categoría:",
  NOT_IN_PROCESS: "No hay un proceso en curso. Por favor, intenta de nuevo.",
  ERROR: "Ocurrió un error. Por favor, intenta de nuevo.",
  INVALID_QUERY:
    "La opción seleccionada no es válida, o no existe. Por favor, intenta de nuevo.",
  SELECT_GASTO: "Selecciona un gasto para editar o eliminar:",
  SELECT_ACTION: "Selecciona una acción:",
  ENTER_NEW_AMOUNT: "Por favor, ingresa el nuevo monto del gasto:",
  ENTER_NEW_DATE:
    "Por favor, ingresa la nueva fecha del gasto (formato: YYYY-MM-DD):",
  GASTO_UPDATED: (amount, category, date) =>
    `¡Gasto actualizado! Nuevo monto: ${formatCurrency(
      amount,
      CURRENCYS_OPTIONS.PESO_ARGENTINO
    )}, Categoría: ${category}, Fecha: ${date}`,
  GASTO_DELETED: (amount) =>
    `¡Gasto eliminado! Monto: ${formatCurrency(
      amount,
      CURRENCYS_OPTIONS.PESO_ARGENTINO
    )}`,
    NOTIFICATION_SET: "Notificación programada exitosamente.",
  YOUR_NOTIFICATIONS: "Tus notificaciones:",
  NOTIFICATION_DELETED: "Notificación eliminada.",
  ENTER_SUBSCRIPTION_NAME: "Por favor, ingresa el nombre de la suscripción:",
  ENTER_AMOUNT: "Ingresa el monto de la suscripción:",
  ENTER_FREQUENCY: "Selecciona la frecuencia de la suscripción:",
  ENTER_NEXT_PAYMENT_DATE: "Ingresa la fecha del próximo pago (formato YYYY-MM-DD):",
  SUBSCRIPTION_ADDED: (name, amount) => `¡Suscripción "${name}" de ${amount} ha sido agregada exitosamente!`,
  ENTER_NEW_SUBSCRIPTION_AMOUNT: (name) => `Ingresa el nuevo monto para la suscripción "${name}":`,
  ENTER_NEW_NEXT_PAYMENT_DATE: "Ingresa la nueva fecha del próximo pago (formato YYYY-MM-DD):",
  SUBSCRIPTION_UPDATED: (name, amount) => `La suscripción "${name}" ha sido actualizada con un monto de ${amount}.`,
  SUBSCRIPTION_DELETED: "La suscripción ha sido eliminada.",
  INVALID_DATE: "Por favor, ingresa una fecha válida.",
};
