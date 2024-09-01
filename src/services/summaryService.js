const GastoRepository = require("../repositories/gastoRepository");
const MetaRepository = require("../repositories/metaRepository");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const moment = require("moment");

const width = 800; // Ancho del gráfico
const height = 400; // Alto del gráfico
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

class SummaryService {
  static async generateSummary(userId) {
    // Obtener gastos y metas del usuario
    const gastos = await GastoRepository.findByUser(userId);
    const metas = await MetaRepository.findByUser(userId);

    // Calcular resumen de gastos por mes
    const gastosPorMes = this.calculateGastosPorMes(gastos);

    // Calcular resumen de gastos por categoría
    const gastosPorCategoria = this.calculateGastosPorCategoria(gastos);

    // Calcular progreso de metas
    const metasProgreso = this.calculateMetasProgreso(metas);

    // Calcular resumen de consumo diario en los últimos 30 días
    const gastosPorDia = this.calculateGastosPorDia(gastos);

    // Generar gráficos
    const charts = await this.generateCharts(
      gastosPorMes,
      gastosPorCategoria,
      metasProgreso,
      gastosPorDia
    );

    const text = this.formatSummaryText(
      gastosPorMes,
      gastosPorCategoria,
      metasProgreso
    );

    return {
      text,
      summary: {
        gastosPorMes,
        gastosPorCategoria,
        metasProgreso,
        gastosPorDia,
      },
      charts,
    };
  }

  static formatSummaryText(gastosPorMes, gastosPorCategoria, metasProgreso) {
    let text =
      "Resumen de Gastos:\
      \n\nGastos por Mes:";
    Object.keys(gastosPorMes).forEach((mes) => {
      text += `\n${mes}: $${gastosPorMes[mes]}`;
    });
    text += "\n\nGastos por Categoría:";
    Object.keys(gastosPorCategoria).forEach((categoria) => {
      text += `\n${categoria}: $${gastosPorCategoria[categoria]}`;
    });
    text += "\n\nProgreso de Metas:";
    metasProgreso.forEach((meta) => {
      text += `\n${meta.name}: ${meta.progress}%`;
    });
    return text;
  }

  static async getLastMonthSummaryByCategory(userId, categoriaId) {
    const hoy = moment().startOf("day");
    const hace30Dias = hoy.clone().subtract(30, "days");

    const gastos = await GastoRepository.findByUserAndCategoryWithinDateRange(
      userId,
      categoriaId,
      hace30Dias.toDate(),
      hoy.toDate()
    );

    const gastosPorDia = {};

    for (let i = 0; i < 30; i++) {
      const dia = hoy.clone().subtract(i, "days").format("YYYY-MM-DD");
      gastosPorDia[dia] = 0;
    }

    gastos.forEach((gasto) => {
      const dia = moment(gasto.date).format("YYYY-MM-DD");
      if (gastosPorDia.hasOwnProperty(dia)) {
        gastosPorDia[dia] += gasto.amount;
      }
    });

    const spentLastMonthChartBuffer = await this.generateBarChart(
      Object.keys(gastosPorDia).reverse(),
      Object.values(gastosPorDia).reverse(),
      "Consumo Diario (Últimos 30 días)"
    );

    return {
      gastosPorDia,
      spentLastMonthChartBuffer: spentLastMonthChartBuffer.toString("base64"),
    };
  }

  static calculateGastosPorMes(gastos) {
    const gastosPorMes = {};
    gastos.forEach((gasto) => {
      const mes = moment(gasto.date).format("YYYY-MM");
      gastosPorMes[mes] = (gastosPorMes[mes] || 0) + gasto.amount;
    });
    return gastosPorMes;
  }

  static calculateGastosPorCategoria(gastos) {
    return gastos.reduce((acc, gasto) => {
      acc[gasto.category.name] = (acc[gasto.category.name] || 0) + gasto.amount;
      return acc;
    }, {});
  }

  static calculateMetasProgreso(metas) {
    return metas.map((meta) => ({
      name: meta.name,
      targetAmount: meta.targetAmount,
      currentAmount: meta.currentAmount,
      progress: ((meta.currentAmount / meta.targetAmount) * 100).toFixed(2),
      category: meta.category,
      deadline: meta.deadline,
    }));
  }

  static calculateGastosPorDia(gastos) {
    const hoy = moment().startOf("day");
    const gastosPorDia = {};

    for (let i = 0; i < 30; i++) {
      const dia = hoy.clone().subtract(i, "days").format("YYYY-MM-DD");
      gastosPorDia[dia] = 0;
    }

    gastos.forEach((gasto) => {
      const dia = moment(gasto.date).format("YYYY-MM-DD");
      if (gastosPorDia.hasOwnProperty(dia)) {
        gastosPorDia[dia] += gasto.amount;
      }
    });

    return gastosPorDia;
  }

  static async generateCharts(
    gastosPorMes,
    gastosPorCategoria,
    metasProgreso,
    gastosPorDia
  ) {
    const gastoMensualChart = await this.generateBarChart(
      Object.keys(gastosPorMes),
      Object.values(gastosPorMes),
      "Gastos por Mes"
    );

    const gastoCategoriaChart = await this.generatePieChart(
      Object.keys(gastosPorCategoria),
      Object.values(gastosPorCategoria),
      "Gastos por Categoría"
    );

    const metaProgresoChart = await this.generateBarChart(
      metasProgreso.map((meta) => meta.name),
      metasProgreso.map((meta) => meta.progress),
      "Progreso de Metas (%)",
      { max: 100 }
    );

    const gastoDiarioChart = await this.generateBarChart(
      Object.keys(gastosPorDia).reverse(),
      Object.values(gastosPorDia).reverse(),
      "Consumo Diario (Últimos 30 días)"
    );

    return {
      gastoMensualChart: gastoMensualChart.toString("base64"),
      gastoCategoriaChart: gastoCategoriaChart.toString("base64"),
      metaProgresoChart: metaProgresoChart.toString("base64"),
      gastoDiarioChart: gastoDiarioChart.toString("base64"),
    };
  }

  static async generateBarChart(labels, data, label, options = {}) {
    return chartJSNodeCanvas.renderToBuffer({
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ...options,
          },
        },
      },
    });
  }

  static async generatePieChart(labels, data, label) {
    return chartJSNodeCanvas.renderToBuffer({
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  }
}

module.exports = SummaryService;
