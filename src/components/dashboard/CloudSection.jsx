"use client";

export default function CloudSection({
  cloudLoading,
  cloudInfo,
}) {
  if (cloudLoading) {
    return (
      <div className="text-gray-600 text-sm">
        Consultando AWS...
      </div>
    );
  }

  if (!cloudInfo) {
    return (
      <div className="text-gray-500">
        No hay datos disponibles desde la nube.
      </div>
    );
  }

  const { total, counts, last, items } = cloudInfo;

  return (
    <div className="space-y-6 w-full">
      
      <h2 className="text-2xl font-bold text-gray-800">
        Estado de la Nube (AWS)
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-indigo-50 p-5 rounded-xl border">
          <p className="text-sm font-semibold text-indigo-800">
            Eventos almacenados
          </p>
          <p className="text-3xl font-bold text-indigo-900">
            {total}
          </p>
        </div>

        <div className="bg-red-50 p-5 rounded-xl border">
          <p className="text-sm font-semibold text-red-800">
            Eventos críticos
          </p>
          <p className="text-3xl font-bold text-red-900">
            {counts?.CRITICO ?? 0}
          </p>
        </div>

        <div className="bg-yellow-50 p-5 rounded-xl border">
          <p className="text-sm font-semibold text-yellow-800">
            Notificación
          </p>
          <p className="text-lg font-bold text-yellow-900">
            Amazon SNS (Email)
          </p>
        </div>
      </div>

      {/* Último evento */}
      {last && (
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-2">
            Último evento registrado en DynamoDB
          </h4>
          <pre className="text-xs bg-gray-900 text-green-200 p-4 rounded border overflow-auto">
{JSON.stringify(last, null, 2)}
          </pre>
        </div>
      )}

      {/* Tabla de eventos */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b font-semibold text-gray-800">
          Últimos eventos (AWS)
        </div>

        <div className="divide-y">
          {items.map((e, i) => (
            <div
              key={i}
              className="p-3 text-sm flex justify-between text-gray-800"
            >
              <span className="font-medium text-gray-900">
                {e.evento}
              </span>
              <span className="text-gray-700">
                {new Date(e.timestamp).toLocaleString("es-ES")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
