// Datos de autenticación (usuario y contraseña)
const USUARIO_CORRECTO = "admin";
const CONTRASENA_CORRECTA = "1234";

// Ejecutar el script solo cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function() {
    // Evento para el login
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const usuario = document.getElementById('usuario').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();

        if (usuario === USUARIO_CORRECTO && contrasena === CONTRASENA_CORRECTA) {
            cambiarPantalla('inicio');
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    });

    // Evento para el envío del formulario de cliente
    document.getElementById('clienteForm').addEventListener('submit', function(event) {
        event.preventDefault();
        guardarCliente();
    });

    // Evento para mostrar la vista previa de imágenes
    document.getElementById('fotos').addEventListener('change', function(event) {
        const preview = document.getElementById('preview');
        preview.innerHTML = ''; // Limpiar vista previa anterior
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('imagen-preview');
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        }
    });

    cargarClientes();
});

// Función para cambiar de pantalla y asignar eventos cuando sea necesario
function cambiarPantalla(pantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activo'));
    document.getElementById(pantalla).classList.add('activo');

    if (pantalla === 'lista') {
        cargarClientes();
    }
}

// Función para obtener la ubicación
function obtenerUbicacion() {
    if (!navigator.geolocation) {
        alert('La geolocalización no es soportada por tu navegador');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = position.coords;
            document.getElementById('ubicacion').value =
                `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
            alert('Ubicación obtenida correctamente');
        },
        (error) => {
            alert(`Error al obtener ubicación: ${error.message}`);
        }
    );
}

// Guardar cliente en localStorage
function guardarCliente() {
    const nombre = document.getElementById('nombre').value.trim();
    const cedula = document.getElementById('cedula').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const ubicacion = document.getElementById('ubicacion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fotosInput = document.getElementById('fotos');
    const fotos = [];

    if (!nombre || !cedula || !direccion || !ubicacion || !telefono) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Guardar las imágenes como URLs base64
    if (fotosInput.files && fotosInput.files.length > 0) {
        Array.from(fotosInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotos.push(e.target.result); // Guardar la imagen como base64
                if (fotos.length === fotosInput.files.length) {
                    guardarClienteFinal(nombre, cedula, direccion, ubicacion, telefono, fotos);
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        guardarClienteFinal(nombre, cedula, direccion, ubicacion, telefono, fotos);
    }
}

function guardarClienteFinal(nombre, cedula, direccion, ubicacion, telefono, fotos) {
    const clienteData = { nombre, cedula, direccion, ubicacion, telefono, fotos };

    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    clientes.push(clienteData);
    localStorage.setItem('clientes', JSON.stringify(clientes));

    alert('Cliente registrado con éxito.');
    document.getElementById('clienteForm').reset();
    document.getElementById('preview').innerHTML = ''; // Limpiar vista previa de imágenes
    cargarClientes();
    cambiarPantalla('lista');
}

// Cargar la lista de clientes
function cargarClientes() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const listaClientes = document.getElementById('listaClientes');
    listaClientes.innerHTML = '';

    if (clientes.length === 0) {
        listaClientes.innerHTML = '<p>No hay clientes registrados.</p>';
    } else {
        clientes.forEach((cliente, index) => {
            const divCliente = document.createElement('div');
            divCliente.classList.add('cliente');
            divCliente.innerHTML = `
                <span>${cliente.nombre}</span>
                <div>
                    <button class="btn-detalles" onclick="verDetalles(${index})">Detalles</button>
                    <button class="btn-editar" onclick="editarCliente(${index})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarCliente(${index})">Eliminar</button>
                </div>
            `;
            listaClientes.appendChild(divCliente);
        });
    }
}

// Función para buscar clientes
function buscarClientes() {
    const query = document.getElementById('buscarCliente').value.toLowerCase();
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const listaClientes = document.getElementById('listaClientes');
    listaClientes.innerHTML = '';

    // Filtrar clientes según nombre, cédula, dirección o teléfono
    const filtered = clientes.filter(cliente => {
         return cliente.nombre.toLowerCase().includes(query) ||
                cliente.cedula.toLowerCase().includes(query) ||
                cliente.direccion.toLowerCase().includes(query) ||
                cliente.telefono.toLowerCase().includes(query);
    });

    if(filtered.length === 0) {
        listaClientes.innerHTML = '<p>No se encontraron clientes.</p>';
    } else {
        // Mostrar cada cliente filtrado, pero se debe buscar el índice original para las acciones
        filtered.forEach(cliente => {
            const originalIndex = clientes.findIndex(c => c.cedula === cliente.cedula && c.nombre === cliente.nombre);
            const divCliente = document.createElement('div');
            divCliente.classList.add('cliente');
            divCliente.innerHTML = `
                <span>${cliente.nombre}</span>
                <div>
                    <button class="btn-detalles" onclick="verDetalles(${originalIndex})">Detalles</button>
                    <button class="btn-editar" onclick="editarCliente(${originalIndex})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarCliente(${originalIndex})">Eliminar</button>
                </div>
            `;
            listaClientes.appendChild(divCliente);
        });
    }
}

// Ver detalles de un cliente
function verDetalles(index) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes[index];

    const detalleCliente = document.getElementById('detalleCliente');
    detalleCliente.innerHTML = `
        <strong>Nombre:</strong> ${cliente.nombre}<br>
        <strong>Cédula:</strong> ${cliente.cedula}<br>
        <strong>Dirección:</strong> ${cliente.direccion}<br>
        <strong>Ubicación:</strong> <a class="mapa-link" href="https://www.google.com/maps?q=${cliente.ubicacion}" target="_blank">Ver en mapa (${cliente.ubicacion})</a><br>
        <strong>Teléfono:</strong> ${cliente.telefono}<br>
        <strong>Fotos:</strong><br>
        <div id="fotosCliente"></div>
    `;

    // Mostrar las imágenes
    const fotosCliente = document.getElementById('fotosCliente');
    if (cliente.fotos && cliente.fotos.length > 0) {
        cliente.fotos.forEach(foto => {
            const img = document.createElement('img');
            img.src = foto;
            img.classList.add('imagen-preview');
            fotosCliente.appendChild(img);
        });
    } else {
        fotosCliente.innerHTML = '<p>No hay fotos registradas.</p>';
    }

    cambiarPantalla('detalles');
}

// Editar un cliente
function editarCliente(index) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes[index];

    document.getElementById('nombre').value = cliente.nombre;
    document.getElementById('cedula').value = cliente.cedula;
    document.getElementById('direccion').value = cliente.direccion;
    document.getElementById('ubicacion').value = cliente.ubicacion;
    document.getElementById('telefono').value = cliente.telefono;

    // Borrar el cliente actual de la lista para que al guardar se actualice correctamente
    clientes.splice(index, 1);
    localStorage.setItem('clientes', JSON.stringify(clientes));

    cambiarPantalla('registro');
}

// Eliminar cliente
function eliminarCliente(index) {
    const usuario = prompt("Ingrese su usuario:");
    const contrasena = prompt("Ingrese su contraseña:");

    if (usuario === USUARIO_CORRECTO && contrasena === CONTRASENA_CORRECTA) {
        let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        if (confirm(`¿Eliminar a "${clientes[index].nombre}"?`)) {
            clientes.splice(index, 1);
            localStorage.setItem('clientes', JSON.stringify(clientes));
            cargarClientes();
        }
    } else {
        alert('Usuario o contraseña incorrectos. No se puede eliminar el cliente.');
    }
}
