import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sensor-detect',
};

export async function POST(request) {
  const { sensor_id, tipo_evento, valor, ubicacion } = await request.json();

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO eventos_deteccion (sensor_id, tipo_evento, valor, ubicacion) VALUES (?, ?, ?, ?)',
      [sensor_id, tipo_evento, valor, ubicacion]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al guardar detección' }), { status: 500 });
  }
}