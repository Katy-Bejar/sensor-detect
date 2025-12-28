"use client";

import { Scatter } from "react-chartjs-2";


export default function AnalyticsSection({ detectionHistory }) {
  // ===== CÁLCULOS =====
    const totalDetecciones = detectionHistory.length;
    const totalAlertas = detectionHistory.filter(d => d.nivel === 'alto').length;

    const distanciaPromedio =
        totalDetecciones > 0
        ? Math.round(
            detectionHistory.reduce((sum, d) => sum + d.valor, 0) /
            totalDetecciones
            )
        : 0;

    // ===== DATA DEL GRÁFICO =====
    const chartData = {
        datasets: [
        {
            label: 'Detecciones',
            data: detectionHistory.map(d => ({
            x: new Date(d.fecha_hora),
            y: d.valor,
            })),
            backgroundColor: detectionHistory.map(d =>
            d.nivel === 'alto'
                ? 'rgba(239,68,68,0.8)'   // rojo
                : 'rgba(59,130,246,0.8)' // azul
            ),
            pointRadius: 7,
            pointHoverRadius: 9,
        },
        {
            label: 'Umbral de alerta (20 cm)',
            type: 'line',
            data: detectionHistory.map(d => ({
            x: new Date(d.fecha_hora),
            y: 20,
            })),
            borderColor: 'rgba(239,68,68,0.6)',
            borderDash: [6, 6],
            pointRadius: 0,
        },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
        x: {
            type: 'time',
            time: {
            unit: 'hour',
            displayFormats: { hour: 'HH:mm' },
            },
            title: {
            display: true,
            text: 'Hora de detección',
            },
        },
        y: {
            min: 0,
            title: {
            display: true,
            text: 'Distancia (cm)',
            },
        },
        },
        plugins: {
        legend: {
            display: true,
            position: 'bottom',
        },
        tooltip: {
            callbacks: {
            label: (context) => `Distancia: ${context.parsed.y} cm`,
            },
        },
        },
    };

    // ===== UI =====
    return (
        <div className="w-full space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
            Análisis de Datos
        </h2>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-5 rounded-xl">
            <p className="text-sm text-blue-700">Total detecciones</p>
            <p className="text-3xl font-bold text-blue-900">
                {totalDetecciones}
            </p>
            </div>

            <div className="bg-red-50 p-5 rounded-xl">
            <p className="text-sm text-red-700">Alertas (≤20 cm)</p>
            <p className="text-3xl font-bold text-red-900">
                {totalAlertas}
            </p>
            </div>

            <div className="bg-green-50 p-5 rounded-xl">
            <p className="text-sm text-green-700">Distancia promedio</p>
            <p className="text-3xl font-bold text-green-900">
                {distanciaPromedio} cm
            </p>
            </div>
        </div>

        {/* GRÁFICO */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
            {totalDetecciones > 0 ? (
            <div className="h-[420px]">
                <Scatter data={chartData} options={options} />
            </div>
            ) : (
            <p className="text-gray-500 text-center py-20">
                No hay suficientes datos para mostrar análisis
            </p>
            )}

            {/* Insight */}
            <div className="mt-4 text-sm text-gray-600">
            {totalAlertas > 0
                ? 'Se detectaron objetos peligrosamente cerca del sensor.'
                : 'No se detectaron eventos críticos en este período.'}
            </div>
        </div>
        </div>
    );
}
