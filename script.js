const USUARIO_ADMIN = "admin";
const CLAVE_ADMIN = "7531";
const USUARIO_USER = "user";
const CLAVE_USER = "1234";

document.addEventListener("DOMContentLoaded", function() {
    if (estaLogueado()) {
        cambiarPantalla('inicio');
    } else {
        cambiarPantalla('login');
    }

    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        iniciarSesion();
    });

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

function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if ((username === USUARIO_ADMIN && password === CLAVE_ADMIN && role === "admin") ||
        (username === USUARIO_USER && password === CLAVE_USER && role === "user")) {
        localStorage.setItem('sesionActiva', 'true');
        localStorage.setItem('role', role);
        Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            cambiarPantalla('inicio');
        });
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
    }).then(() => {
        cambiarPantalla('login');
    });
}

function estaLogueado() {
    return localStorage.getItem('sesionActiva') === 'true';
}

function cambiarPantalla(pantalla) {
    const pantallas = document.querySelectorAll('.pantalla');
    pantallas.forEach(p => p.classList.remove('activo'));
    document.getElementById(pantalla).classList.add('activo');

    const role = localStorage.getItem('role');

    if (pantalla !== 'login' && pantalla !== 'inicio' && !estaLogueado()) {
        Swal.fire({
            icon: 'warning',
            title: 'Acceso denegado',
            text: 'Por favor, inicia sesión para acceder a esta sección.'
        }).then(() => {
            cambiarPantalla('login');
        });
        return;
    }

    if (pantalla === 'registro' && role !== 'admin') {
        Swal.fire({
            icon: 'warning',
            title: 'Acceso denegado',
            text: 'Solo los administradores pueden registrar clientes.'
        }).then(() => {
            cambiarPantalla('inicio');
        });
        return;
    }

    if (pantalla === 'lista') {
        cargarClientes();
    }
}

// Resto del código (obtenerUbicacion, guardarCliente, cargarClientes, etc.) sigue igual...
