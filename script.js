// Inicializar Supabase
const { createClient } = supabase;
const SUPABASE_URL = "https://crptdhbzvwwghyzttwge.supabase.co"; // URL de tu Supabase
const SUPABASE_ANON_KEY = "ÑeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHRkaGJ6dnd3Z2h5enR0d2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NzU3OTgsImV4cCI6MjA1NzE1MTc5OH0.AxMYrRTrTTOV9BREMKLV0B0qRJGvcveFFQ7TCO8GCjE"; // Clave API ANON

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verificar sesión al cargar la página
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

    if (!nombre || !cedula || !direccion || !ubicacion || !telefono) {
        Swal.fire('Completa todos los campos', '', 'warning');
        return;
    }

    const { error } = await supabase
        .from("clientes_morosos")
        .insert([{ nombre, cedula, direccion, ubicacion, telefono }]);

    if (error) {
        Swal.fire('Error al registrar', error.message, 'error');
    } else {
        Swal.fire('Cliente registrado', '', 'success');
        document.getElementById('clienteForm').reset();
        cargarClientes();
        cambiarPantalla('lista');
    }
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
