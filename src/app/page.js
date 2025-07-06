import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Bienvenido a <span className="text-blue-600">Sensor Detect</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sistema avanzado de detección y monitoreo en tiempo real con tecnología de última generación.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-medium"
          >
            Iniciar sesión
          </Link>
          <Link 
            href="/register" 
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg shadow hover:bg-blue-50 transition-colors font-medium"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </main>
  );
}