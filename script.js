// script.js

// --------------------------------------------------------------------------
// 1. Configuración Inicial
// --------------------------------------------------------------------------

// *IMPORTANTE:* Reemplaza con la URL de tu servidor (donde se está ejecutando tu backend)
const SERVER_URL = 'http://tu-dominio-o-ip:3000';

// Conexión a Socket.IO
const socket = io(SERVER_URL);

// Elementos del DOM (para evitar buscarlos repetidamente)
const inicioPantalla = document.getElementById('inicio');
const registroPantalla = document.getElementById('registro');
const listaPantalla = document.getElementById('lista');
const detallesPantalla = document.getElementById('detalles');
const clienteForm = document.getElementById('clienteForm');
const listaClientesDiv = document.getElementById('listaClientes');
const buscarClienteInput = document.getElementById('buscarCliente');
const ubicacionInput = document.getElementById('ubicacion');
const previewDiv = document.getElementById('preview');


// --------------------------------------------------------------------------
// 2. Funciones para Cambiar entre Pantallas
// --------------------------------------------------------------------------

function cambiarPantalla(pantallaId) {
    // Oculta todas las pantallas
    inicioPantalla.classList.remove('activo');
    registroPantalla.classList.remove('activo');
    listaPantalla.classList.remove('activo');
    detallesPantalla.classList.remove('activo');

    // Muestra la pantalla seleccionada
    const pantallaSeleccionada = document.getElementById(pantallaId);
    pantallaSeleccionada.classList.add('activo');

    // Si vamos a la lista, actualizamos la lista de clientes
    if (pantallaId === 'lista') {
        obtenerClientes();
    }
}

// --------------------------------------------------------------------------
// 3. Funciones Relacionadas con la Ubicación
// --------------------------------------------------------------------------

function obtenerUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                ubicacionInput.value = `${lat}, ${lng}`;
            },
            (error) => {
                Swal.fire('Error al obtener la ubicación', error.message, 'error');
            }
        );
    } else {
        Swal.fire('Geolocalización no soportada', 'Tu navegador no soporta la geolocalización.', 'error');
    }
}

// --------------------------------------------------------------------------
// 4. Funciones Relacionadas con la Previsualización de Imágenes
// --------------------------------------------------------------------------

function previsualizarImagenes() {
    const archivos = document.getElementById('fotos').files;
    previewDiv.innerHTML = ''; // Limpia la previsualización anterior

    for (const archivo of archivos) {
        if (archivo) {
            const lector = new FileReader();

            lector.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100px';
                img.style.marginRight = '5px';
                previewDiv.appendChild(img);
            }

            lector.readAsDataURL(archivo);
        }
    }
}

// Agrega un event listener al input de tipo file para previsualizar las imágenes
document.getElementById('fotos').addEventListener('change', previsualizarImagenes);

// --------------------------------------------------------------------------
// 5. Funciones Relacionadas con la Gestión de Clientes (CRUD)
// --------------------------------------------------------------------------

// a. Obtener Clientes
async function obtenerClientes() {
    try {
        const response = await fetch(`${SERVER_URL}/clientes`); // Usa SERVER_URL
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const clientes = await response.json();
        mostrarClientes(clientes);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        Swal.fire('Error al obtener los clientes', 'Por favor, inténtalo de nuevo más tarde.', 'error');
    }
}

// b. Mostrar Clientes
function mostrarClientes(clientes) {
    listaClientesDiv.innerHTML = ''; // Limpia la lista anterior

    if (clientes.length === 0) {
        listaClientesDiv.textContent = 'No se encontraron clientes.';
        return;
    }

    const ul = document.createElement('ul');
    clientes.forEach(cliente => {
        const li = document.createElement('li');
        li.textContent = `${cliente.nombre} - ${cliente.cedula}`;
        li.addEventListener('click', () => mostrarDetallesCliente(cliente._id)); // Muestra detalles al hacer clic
        ul.appendChild(li);
    });
    listaClientesDiv.appendChild(ul);
}

// c. Guardar Cliente
async function guardarCliente(event) {
    event.preventDefault(); // Evita la recarga de la página

    // Obtiene los valores de los campos del formulario
    const nombre = document.getElementById('nombre').value;
    const cedula = document.getElementById('cedula').value;
    const direccion = document.getElementById('direccion').value;
    const ubicacion = ubicacionInput.value;
    const telefono = document.getElementById('telefono').value;
    const fotosInput = document.getElementById('fotos');
    const fotos = []; // Aquí almacenaremos las fotos en base64

    //Validación básica (puedes añadir más validaciones)
    if (!nombre || !cedula || !direccion || !ubicacion || !telefono) {
        Swal.fire('Error', 'Por favor, completa todos los campos.', 'warning');
        return;
    }

    //Procesa las fotos a base64
    if (fotosInput.files && fotosInput.files.length > 0) {
        for (let i = 0; i < fotosInput.files.length; i++) {
            const file = fotosInput.files[i];
            const base64 = await toBase64(file);
            fotos.push(base64);
        }
    }


    try {
        const response = await fetch(`${SERVER_URL}/clientes`, {  // Usa SERVER_URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                cedula,
                direccion,
                ubicacion,
                telefono,
                fotos
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const nuevoCliente = await response.json();
        Swal.fire('Cliente guardado!', '', 'success');
        clienteForm.reset(); // Limpia el formulario
        previewDiv.innerHTML = ''; // Limpia la previsualización
        cambiarPantalla('lista'); // Redirige a la lista de clientes

    } catch (error) {
        console.error('Error al guardar el cliente:', error);
        Swal.fire('Error al guardar el cliente', 'Por favor, inténtalo de nuevo más tarde.', 'error');
    }
}

// Función auxiliar para convertir un archivo a base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// d. Eliminar Cliente (Ejemplo - adaptalo a tu interfaz)
async function eliminarCliente(clienteId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, ¡eliminarlo!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${SERVER_URL}/clientes/${clienteId}`, {  // Usa SERVER_URL
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                Swal.fire(
                    '¡Eliminado!',
                    'El cliente ha sido eliminado.',
                    'success'
                );
                obtenerClientes(); // Refresca la lista
            } catch (error) {
                console.error('Error al eliminar el cliente:', error);
                Swal.fire('Error al eliminar el cliente', 'Por favor, inténtalo de nuevo más tarde.', 'error');
            }
        }
    });
}

// e. Mostrar Detalles del Cliente
async function mostrarDetallesCliente(clienteId) {
    try {
        const response = await fetch(`${SERVER_URL}/clientes/${clienteId}`);  // Usa SERVER_URL
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cliente = await response.json();

        const detalleClienteDiv = document.getElementById('detalleCliente');
        detalleClienteDiv.innerHTML = `
            <h3>${cliente.nombre}</h3>
            <p>Cédula: ${cliente.cedula}</p>
            <p>Dirección: ${cliente.direccion}</p>
            <p>Ubicación: ${cliente.ubicacion}</p>
            <p>Teléfono: ${cliente.telefono}</p>
            
            <h4>Fotos:</h4>
            <div id="fotosCliente"></div>
            <button onclick="eliminarCliente('${cliente._id}')">Eliminar Cliente</button>
        `;

        const fotosClienteDiv = document.getElementById('fotosCliente');
        if (cliente.fotos && cliente.fotos.length > 0) {
            cliente.fotos.forEach(foto => {
                const img = document.createElement('img');
                img.src = foto;
                img.style.maxWidth = '150px';
                img.style.marginRight = '5px';
                fotosClienteDiv.appendChild(img);
            });
        } else {
            fotosClienteDiv.textContent = 'No hay fotos disponibles.';
        }

        cambiarPantalla('detalles');

    } catch (error) {
        console.error('Error al obtener los detalles del cliente:', error);
        Swal.fire('Error al obtener los detalles del cliente', 'Por favor, inténtalo de nuevo más tarde.', 'error');
    }
}

// --------------------------------------------------------------------------
// 6. Funciones Relacionadas con la Búsqueda de Clientes
// --------------------------------------------------------------------------

function buscarClientes() {
    const searchTerm = buscarClienteInput.value.toLowerCase();
    // Aquí puedes implementar la lógica de búsqueda en el frontend
    // O puedes hacer una petición al backend para buscar los clientes
    // y luego actualizar la lista.
    console.log("Buscando:", searchTerm); //Solo para pruebas
    //Ejemplo:  obtenerClientes(`?q=${searchTerm}`); //Pasar el parametro al backend
}

// --------------------------------------------------------------------------
// 7. Funciones Relacionadas con Socket.IO (Tiempo Real)
// --------------------------------------------------------------------------

socket.on('clienteCreado', (nuevoCliente) => {
    console.log('Nuevo cliente creado (Socket):', nuevoCliente);
    Swal.fire('Nuevo cliente creado!', nuevoCliente.nombre, 'info'); //Opcional
    obtenerClientes(); // Refresca la lista
});

socket.on('clienteEliminado', (clienteId) => {
    console.log('Cliente eliminado (Socket):', clienteId);
    Swal.fire('Cliente eliminado!',  'El cliente ha sido eliminado', 'info'); //Opcional
    obtenerClientes(); // Refresca la lista
});


// --------------------------------------------------------------------------
// 8. Event Listeners y Carga Inicial
// --------------------------------------------------------------------------

// Agrega un event listener al formulario para guardar un cliente
clienteForm.addEventListener('submit', guardarCliente);

// Agrega un event listener al input de búsqueda (opcional - si la búsqueda es en tiempo real)
//buscarClienteInput.addEventListener('keyup', buscarClientes);

// Carga la lista de clientes al cargar la página (si la pantalla de lista es la activa por defecto)
//window.onload = obtenerClientes;

//Opcional:  Mostrar la pantalla de inicio al cargar la página
window.onload = function() {
    cambiarPantalla('inicio');
};
