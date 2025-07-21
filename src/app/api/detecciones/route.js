import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

let port = null;
let parser = null;
const clients = new Set();

// Función para enviar datos a todos los clientes conectados
function broadcastData(data) {
  for (const client of clients) {
    if (!client.controller.desiredSize) { // Si el stream está cerrado
      clients.delete(client);
      continue;
    }
    try {
      client.controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error enviando a cliente:', error);
      clients.delete(client);
    }
  }
}

export async function GET() {
  try {
    if (!port) {
      const ports = await SerialPort.list();
      const arduinoPort = ports.find(p => 
        p.manufacturer?.includes('Arduino') || 
        p.productId === '0043' || 
        p.vendorId === '2341'
      );

      if (!arduinoPort) {
        return new Response(JSON.stringify({ error: "Arduino no encontrado" }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      port = new SerialPort({
        path: arduinoPort.path,
        baudRate: 115200
      });

      parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

      parser.on('data', (data) => {
        try {
          const jsonData = JSON.parse(data.toString().trim());
          broadcastData({
            type: 'sensor_data',
            data: {
              device_id: jsonData.device_id || 'SENSOR_01',
              distance: jsonData.distance,
              status: jsonData.status || (jsonData.distance < 10 ? 'critical' : jsonData.distance < 20 ? 'warning' : 'normal'),
              timestamp: jsonData.timestamp || new Date().toISOString()
            }
          });
        } catch (error) {
          console.error('Error procesando dato serial:', error);
        }
      });

      port.on('error', (err) => {
        console.error('Error en puerto serial:', err);
        port = null;
        parser = null;
      });
    }

    const stream = new ReadableStream({
      start(controller) {
        const client = { controller, id: Date.now() };
        clients.add(client);

        // Limpieza cuando se cierra la conexión
        controller.signal?.addEventListener('abort', () => {
          clients.delete(client);
        });
      },
      cancel() {
        console.log('Cliente desconectado');
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error general:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}