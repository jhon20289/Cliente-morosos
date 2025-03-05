const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
      origin: "*",  // ! NOT RECOMMENDED FOR PRODUCTION
      methods: ["GET", "POST", "DELETE"]
    }
  });

// Configuración de CORS (Permite solicitudes desde tu frontend)
app.use(cors());
app.use(express.json({limit: '50mb'})); // Para analizar JSON en las solicitudes
app.use(express.urlencoded({limit: '50mb', extended: true}));


//Conexión a MongoDB Atlas
const uri = "TU_URI_DE_CONEXION_MONGODB_ATLAS"; // Reemplaza con tu URI real
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));


// Definir el esquema de cliente (Modelo de datos)
const clienteSchema = new mongoose.Schema({
    nombre: String,
    cedula: String,
    direccion: String,
    ubicacion: String,
    telefono: String,
    fotos: [String], // Array de strings (base64)
});

const Cliente = mongoose.model('Cliente', clienteSchema);

// Middleware para buscar clientes
const buscarClienteMiddleware = async (req, res, next) => {
    const query = req.query.q;
    if (query) {
        try {
            const clientes = await Cliente.find({
                $or: [
                    { nombre: { $regex: query, $options: 'i' } },
                    { cedula: { $regex: query, $options: 'i' } },
                    { direccion: { $regex: query, $options: 'i' } },
                    { telefono: { $regex: query, $options: 'i' } }
                ]
            });
            req.clientesBuscados = clientes;
        } catch (error) {
            console.error('Error al buscar clientes:', error);
            return res.status(500).json({ message: 'Error al buscar clientes' });
        }
    }
    next();
};

// Rutas API (ejemplo para obtener todos los clientes)
app.get('/clientes', buscarClienteMiddleware, async (req, res) => {
    try {
        const clientes = req.clientesBuscados || await Cliente.find();
        res.json(clientes);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).send('Error al obtener clientes');
    }
});

// Ruta para obtener un cliente por ID
app.get('/clientes/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        console.error('Error al obtener el cliente:', error);
        res.status(500).json({ message: 'Error al obtener el cliente' });
    }
});


// Ruta para crear un nuevo cliente
app.post('/clientes', async (req, res) => {
  try {
      const nuevoCliente = new Cliente(req.body);
      await nuevoCliente.save();
      io.emit('clienteActualizado', nuevoCliente); // Envia el nuevo cliente a todos
      res.status(201).json(nuevoCliente);
  } catch (error) {
      console.error('Error al guardar el cliente:', error);
      res.status(500).json({ message: 'Error al guardar el cliente' });
  }
});

// Ruta para eliminar un cliente por ID
app.delete('/clientes/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndDelete(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        io.emit('clienteActualizado', { _id: req.params.id }); // Envia el ID del cliente eliminado a todos
        res.json({ message: 'Cliente eliminado' });
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
