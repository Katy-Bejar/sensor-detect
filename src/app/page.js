'use client'
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const FloatingBubbles = () => {
  const bubbles = Array.from({ length: 15 }).map((_, i) => {
    const size = 10 + Math.random() * 40;
    return {
      id: `bubble-${i}`,
      size,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
      opacity: 0.05 + Math.random() * 0.1
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-300/30"
          initial={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            opacity: 0
          }}
          animate={{
            y: [0, -100],
            x: [0, (Math.random() - 0.5) * 50],
            opacity: [0, bubble.opacity, 0]
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

const AnimatedGrid = () => {
  const gridSize = 20;
  const gridItems = Array.from({ length: gridSize * gridSize }).map((_, i) => ({
    id: `grid-${i}`,
    x: (i % gridSize) * (100 / gridSize),
    y: Math.floor(i / gridSize) * (100 / gridSize)
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gridItems.map((item) => (
        <motion.div
          key={item.id}
          className="absolute w-0.5 h-0.5 bg-white/5 rounded-full"
          initial={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            opacity: 0
          }}
          animate={{
            opacity: [0, 0.1, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 3 + Math.random() * 7,
            delay: Math.random() * 5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: 30, opacity: 0 }
      }}
      transition={{ duration: 0.5, delay }}
      className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl backdrop-blur-lg border border-white/10 hover:border-blue-400/50 transition-all hover:-translate-y-2 shadow-lg hover:shadow-xl"
    >
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-blue-100">{description}</p>
    </motion.div>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
      <FloatingBubbles />
      <AnimatedGrid />
      
      {/* Luz de acento */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl" />

      <div className="text-center max-w-5xl relative z-10 px-4">
        {/* Logo con efecto de flotación */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            y: [0, -10, 0]
          }}
          transition={{ 
            rotate: { 
              type: "spring", 
              stiffness: 300,
              damping: 15,
              delay: 0.3
            },
            y: {
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
          className="mb-8 flex justify-center"
        >
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 text-white"
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

        {/* Título con efecto de gradiente animado */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-300 bg-300% animate-gradient">
            RataDetect
          </span>
          <br />
          <span className="text-lg sm:text-xl md:text-2xl font-medium text-blue-200 mt-2 block">
            Sistema Inteligente de Monitoreo de Plagas Urbanas
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-lg sm:text-xl text-blue-100 mb-10 max-w-3xl mx-auto"
        >
          Tecnología avanzada para la detección temprana y control de roedores en sistemas de alcantarillado y espacios urbanos.
        </motion.p>

        {/* Botones con efecto de profundidad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold text-lg flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-1 active:translate-y-0"
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
            className="px-8 py-4 bg-white/10 text-white border-2 border-white/20 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold text-lg flex items-center justify-center hover:bg-white/20 backdrop-blur-lg transform hover:-translate-y-1 active:translate-y-0"
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

        {/* Características con animación escalonada */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
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
            }
            title="Monitoreo en Tiempo Real"
            description="Detección instantánea de actividad de roedores con alertas inmediatas"
            delay={0.1}
          />
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
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
            }
            title="Tecnología Precisa"
            description="Sensores ultrasónicos y análisis por IA para máxima precisión"
            delay={0.3}
          />
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            title="Analítica Avanzada"
            description="Reportes detallados y predicción de puntos críticos"
            delay={0.5}
          />
        </motion.div>
      </div>
    </main>
  );
}