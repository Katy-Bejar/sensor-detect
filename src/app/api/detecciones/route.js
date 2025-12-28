export const runtime = 'nodejs';

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// ================== CONFIG ==================
const CRITICAL_THRESHOLD = 20;
const WARNING_THRESHOLD = 30;

const ENTER_CONSECUTIVE = 5;
const EXIT_CONSECUTIVE = 3;

// ================== FOG STATE ==================
let currentState = 'NORMAL';     // NORMAL | WARNING | CRITICO
let transitionTarget = null;     // estado al que se intenta ir
let transitionCounter = 0;

// ================= CLOUD SEND ==================
async function enviarEventoALaNube(payload) {
  const CLOUD_ENDPOINT = process.env.CLOUD_ENDPOINT;

  if (!CLOUD_ENDPOINT) {
    console.warn('⚠️ CLOUD_ENDPOINT no definido. Evento NO enviado a la nube.');
    return;
  }

  try {
    const res = await fetch(CLOUD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(
        `❌ Error enviando a la nube (${res.status})`
      );
    }
  } catch (err) {
    console.error('❌ Error de conexión con la nube:', err.message);
  }
}








// ================== SSE ==================
export async function GET() {
  
    // Buscar Arduino
    const ports = await SerialPort.list();
    const arduinoPortInfo = ports.find(p =>
      p.manufacturer?.includes('Arduino')
    );

    if (!arduinoPortInfo) {
      return Response.json(
        { error: 'Arduino no encontrado' },
        { status: 404 }
      );
    }

    // Abrir puerto serial
    const port = new SerialPort({
      path: arduinoPortInfo.path,
      baudRate: 115200,
    });

    const parser = port.pipe(
      new ReadlineParser({ delimiter: '\n' })
    );


    const stream = new ReadableStream({
      start(controller) {
        parser.on('data', async raw => {
          try {
            const clean = raw.toString().trim();
            if (!clean.startsWith('{')) return;

            const data = JSON.parse(clean);
            const distance = data.distance;

            if (distance <= 0) return;

            // ===== OBSERVED STATE =====
            let observedState = 'NORMAL';
            if (distance <= CRITICAL_THRESHOLD) {
              observedState = 'CRITICO';
            } else if (distance <= WARNING_THRESHOLD) {
              observedState = 'WARNING';
            }

            // ===== SAME STATE =====
            if (observedState === currentState) {
              transitionTarget = null;
              transitionCounter = 0;
            }
            // ===== TRANSITION =====
            else {
              if (transitionTarget !== observedState) {
                transitionTarget = observedState;
                transitionCounter = 1;
              } else {
                transitionCounter++;
              }

              const required =
                observedState === 'NORMAL'
                  ? EXIT_CONSECUTIVE
                  : ENTER_CONSECUTIVE;

              console.log(
                `↪ ${transitionCounter}/${required} hacia ${observedState}`
              );

              if (transitionCounter >= required) {
                const previous = currentState;
                currentState = observedState;
                transitionTarget = null;
                transitionCounter = 0;

                const eventPayload = {
                  device_id: 'SENSOR_01',
                  timestamp: new Date().toISOString(),
                  distance,
                  nivel: currentState,
                  evento:
                    currentState === 'CRITICO'
                      ? 'EVENTO_CRITICO'
                      : currentState === 'WARNING'
                      ? 'EVENTO_WARNING'
                      : 'EVENTO_RECUPERACION',
                };

                console.log(
                  `🚨 CAMBIO DE ESTADO: ${previous} → ${currentState}`
                );
                console.log('📦 Evento generado:', eventPayload);

                await enviarEventoALaNube(eventPayload);
              }
            }

            // ===== SSE =====
            controller.enqueue(
              `data: ${JSON.stringify({
                ...data,
                estado_actual: currentState,
              })}\n\n`
            );
          } catch (err) {
            console.error('FOG error:', err.message);
          }
        });
      },
      cancel() {
        port.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
      },
    });
  
}