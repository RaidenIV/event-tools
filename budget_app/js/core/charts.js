// js/core/charts.js
// Chart.js rendering/update logic (expects Chart.js loaded globally as window.Chart)

let chartExpenses = null;
let chartSales = null;

export function getCharts() {
  return { chartExpenses, chartSales };
}

export function updateCharts(expenseMap, revenueMap) {
  const fmtUSD = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(+v || 0);

  const toNum = (v) => (Number.isFinite(+v) ? +v : 0);

  const cycleColors = (colors, n) => {
    const out = [];
    for (let i = 0; i < n; i++) out.push(colors[i % colors.length]);
    return out;
  };

  // Build sorted, positive-only entries (keeps charts clean)
  const buildEntries = (mapObj) => {
    const entries = Object.entries(mapObj || {})
      .map(([k, v]) => [k, toNum(v)])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);

    return {
      labels: entries.map((e) => e[0]),
      values: entries.map((e) => e[1]),
    };
  };

  // Visibility helpers (Chart.js v3/v4)
  const isVisible = (chart, i) => {
    if (typeof chart.getDataVisibility === "function") return chart.getDataVisibility(i);
    const meta = chart.getDatasetMeta(0);
    const el = meta?.data?.[i];
    return !(el && el.hidden === true);
  };

  const visibleTotal = (chart, values) => {
    let t = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] > 0 && isVisible(chart, i)) t += values[i];
    }
    return t;
  };

  const legendOnClick = (e, legendItem, legend) => {
    const chart = legend.chart;
    const idx = legendItem.index;

    if (typeof chart.toggleDataVisibility === "function") {
      chart.toggleDataVisibility(idx);
    } else {
      const meta = chart.getDatasetMeta(0);
      if (meta?.data?.[idx]) meta.data[idx].hidden = !meta.data[idx].hidden;
    }

    chart.update(); // <- forces legend text recompute
  };

  const makeLegendGenerateLabels = () => (chart) => {
    const ds = chart.data.datasets?.[0];
    const labels = chart.data.labels || [];
    const values = (ds?.data || []).map(toNum);
    const total = visibleTotal(chart, values);

    return labels.map((label, i) => {
      const v = values[i] || 0;
      const pct = total > 0 ? (v / total) * 100 : 0;

      const fillStyle = Array.isArray(ds.backgroundColor)
        ? ds.backgroundColor[i]
        : ds.backgroundColor;

      return {
        text: `${label}: ${fmtUSD(v)} (${pct.toFixed(0)}%)`,
        fillStyle,
        strokeStyle: fillStyle,
        lineWidth: 1,
        hidden: !isVisible(chart, i),
        index: i,
      };
    });
  };

  const tooltipLabel = (ctx) => {
    const v = toNum(ctx.parsed);
    const values = (ctx.chart.data.datasets?.[0]?.data || []).map(toNum);
    const total = visibleTotal(ctx.chart, values);
    const pct = total > 0 ? (v / total) * 100 : 0;

    // Dollar FIRST, then percent
    return `${ctx.label}: ${fmtUSD(v)} (${pct.toFixed(0)}%)`;
  };

  const EXP_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#9C27B0", "#FF9800", "#607D8B"];
  const REV_COLORS = ["#4CAF50", "#03A9F4", "#FFC107", "#E91E63", "#9E9E9E"];

  const exp = buildEntries(expenseMap);
  const rev = buildEntries(revenueMap);

  const makeOrUpdatePie = (existingChart, canvasId, labels, values, baseColors) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return existingChart;

    const colors = cycleColors(baseColors, values.length);

    if (!existingChart) {
      return new Chart(canvas.getContext("2d"), {
        type: "pie",
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: colors }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              onClick: legendOnClick,
              labels: {
                generateLabels: makeLegendGenerateLabels(),
              },
            },
            tooltip: {
              callbacks: { label: tooltipLabel },
            },
          },
        },
      });
    }

    // Update existing chart in-place (keeps it stable + refreshes legend)
    existingChart.data.labels = labels;
    existingChart.data.datasets[0].data = values;
    existingChart.data.datasets[0].backgroundColor = colors;

    // If slice count changed, reset visibility so legend math stays sane
    if (typeof existingChart.setDataVisibility === "function") {
      for (let i = 0; i < labels.length; i++) existingChart.setDataVisibility(i, true);
    }

    existingChart.update();
    return existingChart;
  };

  chartExpenses = makeOrUpdatePie(chartExpenses, "expensesChart", exp.labels, exp.values, EXP_COLORS);
  chartSales    = makeOrUpdatePie(chartSales, "salesChart",    rev.labels, rev.values, REV_COLORS);

  // Keep downloadChartsPNG() happy if it checks window.*
  window.chartExpenses = chartExpenses;
  window.chartSales = chartSales;
}
