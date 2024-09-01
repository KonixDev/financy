const CURRENCYS_OPTIONS = {
  PESO_ARGENTINO: "ARS",
  DOLAR: "USD",
  EURO: "EUR",
};

const CURRENCYS_FORMAT = {
  ARS: "es-AR",
  USD: "en-US",
  EURO: "es-ES",
};

/**
 * Formats the amount to the given currency
 * @param {long} amount - The amount to format
 * @param {string} currencyOption - The currency option to format the amount
 * @returns
 */
function formatCurrency(amount, currencyOption) {
  // Convert the long number to currency Option
  try {
    return new Intl.NumberFormat(CURRENCYS_FORMAT[currencyOption], {
      style: "currency",
      currency: currencyOption,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error(error);
  }
  return amount;
}

module.exports = {
  CURRENCYS_OPTIONS,
  CURRENCYS_FORMAT,
  formatCurrency,
};
