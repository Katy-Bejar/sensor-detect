import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';


// Contador de alertas consecutivas
let consecutiveAlerts = 0;


// ================== SSE ==================
export async function GET() {
  try {
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
        parser.on('data', async (data) => {
          try {
            const cleanData = data.toString().trim();

            if (
              cleanData.startsWith('{') &&
              cleanData.endsWith('}')
            ) {
              const jsonData = JSON.parse(cleanData);

              // ========== LÓGICA DE ALERTAS ==========
              if (jsonData.distance > 0 && jsonData.distance <= 20) {
                consecutiveAlerts++;
                console.log(
                  `⚠️ Alerta ${consecutiveAlerts}/5`
                );

                if (consecutiveAlerts >= 5) {
                  console.log('🚨 EVENTO CRÍTICO DETECTADO (FOG)');

                  jsonData.evento = 'EVENTO_CRITICO';
                  jsonData.nivel = 'CRITICO';
                  jsonData.timestamp = new Date().toISOString();

                  console.log(
                    '📦 JSON ENVIADO A LA NUBE:',
                    JSON.stringify(jsonData, null, 2)
                  );

                  // AQUÍ luego enviaremos el evento a AWS
                  // enviarEventoALaNube(jsonData);

                  consecutiveAlerts = 0;
                }

              } else {
                // Si vuelve a normal, se reinicia
                consecutiveAlerts = 0;
              }

              // Enviar por SSE
              controller.enqueue(
                `data: ${JSON.stringify(jsonData)}\n\n`
              );
            }
          } catch (err) {
            console.error('Error procesando datos:', err);
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
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
