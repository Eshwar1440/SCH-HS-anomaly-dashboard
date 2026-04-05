import { useRef, useEffect, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const MAX_POINTS = 300;

export function useChart({ label, color, yLabel, hasThreshold = false }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const existing = Chart.getChart(canvasRef.current);
    if (existing) existing.destroy();

    const ctx = canvasRef.current.getContext('2d');

    const datasets = [
      {
        label,
        data: [],
        borderColor: color,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0,
        fill: true,
        backgroundColor: (context) => {
          const { ctx: c, chartArea } = context.chart;
          if (!chartArea) return 'transparent';
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, color + '28');
          g.addColorStop(1, color + '00');
          return g;
        },
      },
    ];

    if (hasThreshold) {
      datasets.push({
        label: 'h',
        data: [],
        borderColor: '#ef444455',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
        fill: false,
      });
    }

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend:  { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            ticks: { color: '#3a4a49', maxTicksLimit: 5, font: { size: 8, family: 'Space Grotesk' } },
            grid:  { color: 'rgba(58,74,73,0.15)' },
            border:{ color: 'rgba(58,74,73,0.3)' },
          },
          y: {
            title: { display: true, text: yLabel, color: '#3a4a49', font: { size: 8, family: 'Space Grotesk' } },
            ticks: { color: '#3a4a49', maxTicksLimit: 4, font: { size: 8, family: 'Space Grotesk' } },
            grid:  { color: 'rgba(58,74,73,0.15)' },
            border:{ color: 'rgba(58,74,73,0.3)' },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []); // eslint-disable-line

  const push = useCallback((idx, value, threshold) => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels.push(idx);
    chart.data.datasets[0].data.push(value);
    if (hasThreshold && threshold != null) chart.data.datasets[1].data.push(threshold);
    if (chart.data.labels.length > MAX_POINTS) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(ds => ds.data.shift());
    }
    chart.update('none');
  }, [hasThreshold]);

  const clear = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = [];
    chart.data.datasets.forEach(ds => ds.data = []);
    chart.update('none');
  }, []);

  const setColor = useCallback((newColor) => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.datasets[0].borderColor = newColor;
    chart.update('none');
  }, []);

  return { canvasRef, push, clear, setColor };
}