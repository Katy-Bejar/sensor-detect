import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sensor-detect',
};

export async function POST(request) {
  const { email, password } = await request.json();

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return new Response(JSON.stringify({ error: 'El usuario ya existe' }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute('INSERT INTO usuarios (email, password) VALUES (?, ?)', [
      email,
      hashedPassword,
    ]);

    return new Response(JSON.stringify({ message: 'Usuario registrado' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al registrar usuario' }), { status: 500 });
  }
}

export async function PUT(request) {
  const { email, password } = await request.json();

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), { status: 401 });
    }

    const cookieStore = cookies();
    cookieStore.set('usuario_email', email, {
      httpOnly: true,
      path: '/',
    });

    return new Response(JSON.stringify({ message: 'Login exitoso' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error en el login' }), { status: 500 });
  }
}