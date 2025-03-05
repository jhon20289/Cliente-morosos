
// server.js
require('dotenv').config(); // Cargar variables de entorno desde .env

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Reemplaza con la URL de tu front-end en producción
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const port = process.env.PORT || 3000;

// --------------------------------------------------------------------------
// 1. Middleware
// --------------------------------------------------------------------------

app.use(cors());
app.use(express.json()); // Para analizar el cuerpo de las peticiones como JSON

// --------------------------------------------------------------------------
// 2. Conexión a MongoDB Atlas
// --------------------------------------------------------------------------

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clientes_morosos'; // Usar variable de entorno o una URL local por defecto

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB Atlas:', err));

// --------------------------------------------------------------------------
// 3. Definición del Modelo de Cliente (Mongoose Schema)
// --------------------------------------------------------------------------

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  direccion: { type: String, required: true },
  ubicacion: { type: String, required: true },
  telefono: { type: String, required: true },
  fotos: [String] // Array de URLs o datos base64 de las fotos
});

const Cliente = mongoose.model('Cliente', clienteSchema);

// --------------------------------------------------------------------------
// 4. Rutas de la API (RESTful)
// --------------------------------------------------------------------------

// a. Obtener todos los clientes
app.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
});

// b. Obtener un cliente por ID
app.get('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el cliente' });
  }
});

// c. Crear un nuevo cliente
app.post('/clientes', async (req, res) => {
  const cliente = new Cliente({
    nombre: req.body.nombre,
    cedula: req.body.cedula,
    direccion: req.body.direccion,
    ubicacion: req.body.ubicacion,
    telefono: req.body.telefono,
    fotos: req.body.fotos
  });

  try {
    const nuevoCliente = await cliente.save();
    // Emitir evento de Socket.IO para notificar a los clientes
    io.emit('clienteCreado', nuevoCliente);
    res.status(201).json(nuevoCliente);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error al crear el cliente', error: err.message });
  }
});

// d. Actualizar un cliente existente
app.put('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    // Emitir evento de Socket.IO para notificar a los clientes
    io.emit('clienteActualizado', cliente);
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error al actualizar el cliente' });
  }
});

// e. Eliminar un cliente
app.delete('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    // Emitir evento de Socket.IO para notificar a los clientes
    io.emit('clienteEliminado', req.params.id);
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el cliente' });
  }
});

// --------------------------------------------------------------------------
// 5. Configuración de Socket.IO
// --------------------------------------------------------------------------

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado:', socket.id);
  });
});

// --------------------------------------------------------------------------
// 6. Iniciar el Servidor
// --------------------------------------------------------------------------

server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
