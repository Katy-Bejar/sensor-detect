'use client'
import Link from "next/link";
import { motion } from "framer-motion";

// Generamos valores fijos para las partículas basados en un índice
// Esto asegura consistencia entre SSR y cliente
const generateParticleStyle = (index) => {
  // Usamos un algoritmo determinista basado en el índice
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed * 100) * 10000;
    return x - Math.floor(x);
  };
  
  return {
    width: 5 + pseudoRandom(index) * 20,
    height: 5 + pseudoRandom(index + 1) * 20,
    left: `${pseudoRandom(index + 2) * 100}%`,
    top: `${pseudoRandom(index + 3) * 100}%`,
  };
};


export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4 relative overflow-hidden">
      {/* Partículas de fondo con valores deterministas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500 opacity-10"
            initial={generateParticleStyle(i)}
            animate={{
              y: [(i % 3) * 10, ((i % 5) - 2) * 20],
              x: [(i % 2) * 5, ((i % 7) - 3) * 15],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 10 + (i % 10),
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="text-center max-w-4xl relative z-10">
        {/* Logo o icono */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
        >
          Plataforma de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Monitorización Inteligente</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto"
        >
          Solución avanzada de detección en tiempo real con inteligencia artificial y análisis predictivo para tu negocio.
        </motion.p>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-1"
          >
            Iniciar sesión
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 bg-white/10 text-white border-2 border-white/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center hover:bg-white/20 backdrop-blur-sm transform hover:-translate-y-1"
          >
            Registrarse
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"
              />
            </svg>
          </Link>
        </motion.div>

        {/* Características */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left"
        >
          {[
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
              title: "Tiempo real",
              description: "Datos actualizados al instante con latencia mínima",
            },
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              ),
              title: "Seguridad",
              description: "Protección de datos con cifrado de última generación",
            },
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              ),
              title: "Alertas inteligentes",
              description: "Notificaciones contextuales y procesables",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:border-blue-400/30 transition-all"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-blue-100">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}