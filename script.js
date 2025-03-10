// Cargar Supabase
const { createClient } = supabase;
const SUPABASE_URL = "https://crptdhbzvwwghyzttwge.supabase.co"; // Reemplaza con tu URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI..."; // Reemplaza con tu clave API
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function() {
    if (estaLogueado()) {
        cambiarPantalla('inicio');
    } else {
        cambiarPantalla('login');
    }

    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        await iniciarSesion();
    });

    document.getElementById('clienteForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        await guardarCliente();
    });

    cargarClientes();
});

async function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    let { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

    if (data) {
        localStorage.setItem("sesionActiva", "true");
        localStorage.setItem("role", data.role);

        Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            timer: 1500,
            showConfirmButton: false
        }).then(() => cambiarPantalla('inicio'));
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Credenciales incorrectas',
            text: 'Por favor, verifica tu usuario y contraseña.'
        });
    }
}

function cerrarSesion() {
    localStorage.removeItem('sesionActiva');
    localStorage.removeItem('role');
    Swal.fire({
        icon: 'info',
        title: 'Sesión cerrada',
        timer: 1500,
        showConfirmButton: false
    }).then(() => cambiarPantalla('login'));
}

function estaLogueado() {
    return localStorage.getItem('sesionActiva') === 'true';
}

async function guardarCliente() {
    const nombre = document.getElementById('nombre').value.trim();
    const cedula = document.getElementById('cedula').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const ubicacion = document.getElementById('ubicacion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fotosInput = document.getElementById('fotos');

    if (!nombre || !cedula || !direccion || !ubicacion || !telefono) {
        Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa todos los campos.' });
        return;
    }

    let fotos = [];
    if (fotosInput.files.length > 0) {
        fotos = await subirImagenes(fotosInput.files);
    }

    const { data, error } = await supabase
        .from("clientes_morosos")
        .insert([{ nombre, cedula, direccion, ubicacion, telefono, foto1: fotos[0] || null }]);

    if (error) {
        Swal.fire({ icon: 'error', title: 'Error al registrar', text: error.message });
    } else {
        Swal.fire({ icon: 'success', title: 'Cliente registrado', timer: 1500, showConfirmButton: false });
        document.getElementById('clienteForm').reset();
        cargarClientes();
        cambiarPantalla('lista');
    }
}

async function subirImagenes(files) {
    let urls = [];
    for (let file of files) {
        const filePath = `clientes/${file.name}`;
        let { data, error } = await supabase.storage
            .from("imagenes")
            .upload(filePath, file);

        if (data) {
            let { publicURL } = supabase.storage.from("imagenes").getPublicUrl(filePath);
            urls.push(publicURL);
        }
    }
    return urls;
}

async function cargarClientes() {
    const { data, error } = await supabase
        .from("clientes_morosos")
        .select("*");

    const listaClientes = document.getElementById('listaClientes');
    listaClientes.innerHTML = '';

    if (error || data.length === 0) {
        listaClientes.innerHTML = '<p>No hay clientes registrados.</p>';
        return;
    }

    data.forEach((cliente, index) => {
        const divCliente = document.createElement('div');
        divCliente.classList.add('cliente');
        divCliente.innerHTML = `
            <span>${cliente.nombre}</span>
            <div>
                <button class="btn-detalles" onclick="verDetalles(${index})">Detalles</button>
                ${localStorage.getItem('role') === 'admin' ? `
                <button class="btn-editar" onclick="editarCliente(${index})">Editar</button>
                <button class="btn-eliminar" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
                ` : ''}
            </div>
        `;
        listaClientes.appendChild(divCliente);
    });
}

async function eliminarCliente(clienteId) {
    let { error } = await supabase
        .from("clientes_morosos")
        .delete()
        .eq("id", clienteId);

    if (error) {
        Swal.fire({ icon: 'error', title: 'Error al eliminar', text: error.message });
    } else {
        Swal.fire({ icon: 'success', title: 'Cliente eliminado', timer: 1500, showConfirmButton: false });
        cargarClientes();
    }
}

async function verDetalles(index) {
    const { data, error } = await supabase
        .from("clientes_morosos")
        .select("*")
        .eq("id", index)
        .single();

    if (!data) return;

    const detalleCliente = document.getElementById('detalleCliente');
    detalleCliente.innerHTML = `
        <strong>Nombre:</strong> ${data.nombre}<br>
        <strong>Cédula:</strong> ${data.cedula}<br>
        <strong>Dirección:</strong> ${data.direccion}<br>
        <strong>Ubicación:</strong> <a class="mapa-link" href="https://www.google.com/maps?q=${data.ubicacion}" target="_blank">Ver en mapa (${data.ubicacion})</a><br>
        <strong>Teléfono:</strong> ${data.telefono}<br>
        <strong>Fotos:</strong><br>
        <div id="fotosCliente"></div>
    `;

    const fotosCliente = document.getElementById('fotosCliente');
    if (data.foto1) {
        const img = document.createElement('img');
        img.src = data.foto1;
        img.classList.add('imagen-preview');
        fotosCliente.appendChild(img);
    }

    cambiarPantalla('detalles');
}
