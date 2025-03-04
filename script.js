// Importar e inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "clientes-morosos-688eb.firebaseapp.com",
    projectId: "clientes-morosos-688eb",
    storageBucket: "clientes-morosos-688eb.appspot.com",
    messagingSenderId: "151674769366",
    appId: "1:151674769366:web:a5ec137a0bfc0cdd2f5e77"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos de autenticación (usuario y contraseña)
const USUARIO_CORRECTO = "admin";
const CONTRASENA_CORRECTA = "1234";

// Evento al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('clienteForm').addEventListener('submit', guardarCliente);
    document.getElementById('fotos').addEventListener('change', mostrarVistaPrevia);
    cargarClientes();
});

// Función para el login
function login(event) {
    event.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();

    if (usuario === USUARIO_CORRECTO && contrasena === CONTRASENA_CORRECTA) {
        cambiarPantalla('inicio');
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
}

// Función para cambiar de pantalla
function cambiarPantalla(pantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activo'));
    document.getElementById(pantalla).classList.add('activo');

    if (pantalla === 'lista') {
        cargarClientes();
    }
}

// Obtener ubicación
function obtenerUbicacion() {
    if (!navigator.geolocation) {
        alert('La geolocalización no es soportada por tu navegador.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = position.coords;
            document.getElementById('ubicacion').value = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
            alert('Ubicación obtenida correctamente');
        },
        (error) => {
            alert(`Error al obtener ubicación: ${error.message}`);
        }
    );
}

// Guardar cliente en Firestore
async function guardarCliente(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const cedula = document.getElementById('cedula').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const ubicacion = document.getElementById('ubicacion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (!nombre || !cedula || !direccion || !ubicacion || !telefono) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        await addDoc(collection(db, "clientes"), { nombre, cedula, direccion, ubicacion, telefono });
        alert('Cliente registrado con éxito.');
        document.getElementById('clienteForm').reset();
        cambiarPantalla('lista');
        cargarClientes();
    } catch (error) {
        console.error("Error al guardar cliente: ", error);
    }
}

// Cargar clientes desde Firestore
async function cargarClientes() {
    const listaClientes = document.getElementById('listaClientes');
    listaClientes.innerHTML = '<p>Cargando clientes...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        listaClientes.innerHTML = '';

        if (querySnapshot.empty) {
            listaClientes.innerHTML = '<p>No hay clientes registrados.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const cliente = doc.data();
            const divCliente = document.createElement('div');
            divCliente.classList.add('cliente');
            divCliente.innerHTML = `
                <span>${cliente.nombre}</span>
                <div>
                    <button class="btn-detalles" onclick="verDetalles('${doc.id}')">Detalles</button>
                </div>
            `;
            listaClientes.appendChild(divCliente);
        });
    } catch (error) {
        console.error("Error al cargar clientes: ", error);
    }
}

// Mostrar detalles de un cliente
async function verDetalles(id) {
    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        let clienteSeleccionado;

        querySnapshot.forEach((doc) => {
            if (doc.id === id) {
                clienteSeleccionado = doc.data();
            }
        });

        if (!clienteSeleccionado) {
            alert("Cliente no encontrado.");
            return;
        }

        const detalleCliente = document.getElementById('detalleCliente');
        detalleCliente.innerHTML = `
            <strong>Nombre:</strong> ${clienteSeleccionado.nombre}<br>
            <strong>Cédula:</strong> ${clienteSeleccionado.cedula}<br>
            <strong>Dirección:</strong> ${clienteSeleccionado.direccion}<br>
            <strong>Ubicación:</strong> <a class="mapa-link" href="https://www.google.com/maps?q=${clienteSeleccionado.ubicacion}" target="_blank">Ver en mapa (${clienteSeleccionado.ubicacion})</a><br>
            <strong>Teléfono:</strong> ${clienteSeleccionado.telefono}<br>
        `;

        cambiarPantalla('detalles');
    } catch (error) {
        console.error("Error al obtener detalles del cliente: ", error);
    }
}
