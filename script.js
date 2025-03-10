// Inicializar Supabase
const { createClient } = supabase;
const SUPABASE_URL = "https://crptdhbzvwwghyzttwge.supabase.co"; // Reemplaza con tu URL de Supabase
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY"; // Reemplaza con tu clave API
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verificar sesión
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

// Iniciar sesión
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
        Swal.fire('Inicio de sesión exitoso', '', 'success');
        cambiarPantalla('inicio');
    } else {
        Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
    }
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.clear();
    Swal.fire('Sesión cerrada', '', 'info');
    cambiarPantalla('login');
}

// Verificar si el usuario está logueado
function estaLogueado() {
    return localStorage.getItem('sesionActiva') === 'true';
}

// Guardar cliente en Supabase
async function guardarCliente() {
    const nombre = document.getElementById('nombre').value.trim();
    const cedula = document.getElementById('cedula').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const ubicacion = document.getElementById('ubicacion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fotosInput = document.getElementById('fotos');

    if (!nombre || !cedula || !direccion || !ubicacion || !telefono) {
        Swal.fire('Completa todos los campos', '', 'warning');
        return;
    }

    let fotos = [];
    if (fotosInput.files.length > 0) {
        fotos = await subirImagenes(fotosInput.files);
    }

    const { error } = await supabase
        .from("clientes_morosos")
        .insert([{ nombre, cedula, direccion, ubicacion, telefono, foto1: fotos[0] || null }]);

    if (error) {
        Swal.fire('Error al registrar', error.message, 'error');
    } else {
        Swal.fire('Cliente registrado', '', 'success');
        document.getElementById('clienteForm').reset();
        cargarClientes();
        cambiarPantalla('lista');
    }
}

// Subir imágenes a Supabase Storage
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

// Cargar lista de clientes
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

    data.forEach(cliente => {
        listaClientes.innerHTML += `
            <div class="cliente">
                <span>${cliente.nombre}</span>
                <button onclick="verDetalles(${cliente.id})">Detalles</button>
            </div>
        `;
    });
}

// Cambiar de pantalla
function cambiarPantalla(pantalla) {
    document.querySelectorAll('.pantalla').forEach(div => div.classList.remove('activo'));
    document.getElementById(pantalla).classList.add('activo');
}
