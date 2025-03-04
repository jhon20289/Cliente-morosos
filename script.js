document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('clienteForm').addEventListener('submit', function(event) {
        event.preventDefault();
        guardarCliente();
    });

    document.getElementById('fotos').addEventListener('change', function(event) {
        const preview = document.getElementById('preview');
        preview.innerHTML = '';
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

function cambiarPantalla(pantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activo'));
    document.getElementById(pantalla).classList.add('activo');

    if (pantalla === 'lista') {
        cargarClientes();
    }
}

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

    if (fotosInput.files && fotosInput.files.length > 0) {
        Array.from(fotosInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotos.push(e.target.result);
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
    document.getElementById('preview').innerHTML = '';
    cargarClientes();
    cambiarPantalla('lista');
}

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

function buscarClientes() {
    const query = document.getElementById('buscarCliente').value.toLowerCase();
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const listaClientes = document.getElementById('listaClientes');
    listaClientes.innerHTML = '';

    const filtered = clientes.filter(cliente => {
         return cliente.nombre.toLowerCase().includes(query) ||
                cliente.cedula.toLowerCase().includes(query) ||
                cliente.direccion.toLowerCase().includes(query) ||
                cliente.telefono.toLowerCase().includes(query);
    });

    if(filtered.length === 0) {
        listaClientes.innerHTML = '<p>No se encontraron clientes.</p>';
    } else {
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

function editarCliente(index) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes[index];

    document.getElementById('nombre').value = cliente.nombre;
    document.getElementById('cedula').value = cliente.cedula;
    document.getElementById('direccion').value = cliente.direccion;
    document.getElementById('ubicacion').value = cliente.ubicacion;
    document.getElementById('telefono').value = cliente.telefono;

    clientes.splice(index, 1);
    localStorage.setItem('clientes', JSON.stringify(clientes));

    cambiarPantalla('registro');
}

function eliminarCliente(index) {
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    if (confirm(`¿Eliminar a "${clientes[index].nombre}"?`)) {
        clientes.splice(index, 1);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        cargarClientes();
    }
}
