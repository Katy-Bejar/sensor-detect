import { NextResponse } from 'next/server';

export async function GET() {
  // Configuración inicial para SSE
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Mantener la conexión abierta
  const keepAlive = setInterval(() => {
    writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`));
  }, 30000);

  // En un sistema real, aquí te conectarías a tu fuente de datos en tiempo real
  // como WebSockets, MQTT, o base de datos con capacidad de pub/sub

  return new NextResponse(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}