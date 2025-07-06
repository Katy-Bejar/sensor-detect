import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const cookieStore = cookies();
  const email = cookieStore.get("usuario_email");

  if (!email) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Bienvenido, {email.value}!</h1>
          <p className="text-gray-600">Panel de monitoreo en tiempo real</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de estadísticas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Eventos recientes</h2>
            <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">Gráfico de eventos aparecerá aquí</p>
            </div>
          </div>

          {/* Tarjeta de sensores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Estado de sensores</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Sensor 1: Activo</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Sensor 2: Activo</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span>Sensor 3: En mantenimiento</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de acciones rápidas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Acciones rápidas</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Generar reporte
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}