import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

export async function GET() {
  try {
    // Listar puertos disponibles
    const ports = await SerialPort.list();
    const arduinoPortInfo = ports.find(p => p.manufacturer?.includes('Arduino'));

    if (!arduinoPortInfo) {
      return Response.json({ error: "Arduino no encontrado" }, { status: 404 });
    }

    // Configurar conexión serial
    const port = new SerialPort({
      path: arduinoPortInfo.path,
      baudRate: 115200 // Debe coincidir con tu Arduino
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
    
    // Escuchar datos (SSE)
    const stream = new ReadableStream({
      start(controller) {
        parser.on('data', (data) => {
          try {
            // Limpiar y parsear datos JSON
            const cleanData = data.toString().trim();
            if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
              const jsonData = JSON.parse(cleanData);
              controller.enqueue(`data: ${JSON.stringify(jsonData)}\n\n`);
            }
          } catch (e) {
            console.error("Error parsing:", e);
          }
        });
      },
      cancel() {
        port.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}