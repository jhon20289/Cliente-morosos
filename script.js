const USUARIO_ADMIN = "admin";
const CLAVE_ADMIN = "7531";

document.addEventListener("DOMContentLoaded", function() {
    // Inicializa la sesión al cargar la página
    if (estaLogueado()) {
        cambiarPantalla('inicio'); // Si ya está logueado, muestra la pantalla de inicio
    } else {
        cambiarPantalla('login'); // Si no, muestra la pantalla de login
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

    if (username === USUARIO_ADMIN && password === CLAVE_ADMIN) {
        // Credenciales válidas
        localStorage.setItem('sesionActiva', 'true');
        Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            cambiarPantalla('inicio');
        });
    } else {
        // Credenciales inválidas
        Swal.fire({
            icon: 'error',
            title: 'Credenciales incorrectas',
            text: 'Por favor, verifica tu usuario y contraseña.'
        });
    }
}

function cerrarSesion() {
    localStorage.removeItem('sesionActiva');
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

    // Evita acceder a las pantallas protegidas sin estar logueado
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

    if (pantalla === 'lista') {
        cargarClientes();
    }
}

function obtenerUbicacion() {
    if (!navigator.geolocation) {
       Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La geolocalización no es soportada por tu navegador',
        });
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = position.coords;
            document.getElementById('ubicacion').value =
                `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
           Swal.fire({
                icon: 'success',
                title: 'Ubicación obtenida',
                text: 'Ubicación obtenida correctamente',
                timer: 1500,
                showConfirmButton: false
            });

        },
        (error) => {
            let errorMessage = "Error al obtener la ubicación.";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Permiso denegado para acceder a la ubicación.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "La información de ubicación no está disponible.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Tiempo de espera agotado para obtener la ubicación.";
                    break;
                case error.UNKNOWN_ERROR:
                    errorMessage = "Ocurrió un error desconocido al obtener la ubicación.";
                    break;
            }
            Swal.fire({
                icon: 'error',
                title: 'Error de geolocalización',
                text: errorMessage,
            });
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
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos.',
        });
        return;
    }

    // Simple validation for cedula and telefono (you can improve these)
    if (!/^\d+$/.test(cedula)) {
        Swal.fire({
            icon: 'warning',
            title: 'Cédula inválida',
            text: 'Por favor, introduce una cédula válida (solo números).',
        });
        return;
    }

    if (!/^\d+$/.test(telefono)) {
       Swal.fire({
            icon: 'warning',
            title: 'Teléfono inválido',
            text: 'Por favor, introduce un teléfono válido (solo números).',
        });
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

    Swal.fire({
        icon: 'success',
        title: 'Cliente registrado',
        text: 'Cliente registrado con éxito.',
        timer: 1500,
        showConfirmButton: false
    });
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
                    <button class="btn-eliminar" onclick="confirmarEliminarCliente(${index})">Eliminar</button>
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
                    <button class="btn-eliminar" onclick="confirmarEliminarCliente(${originalIndex})">Eliminar</button>
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

function confirmarEliminarCliente(index) {
  Swal.fire({
    title: 'Confirmar Eliminación',
    text: 'Ingrese usuario y contraseña de administrador para confirmar:',
    html:
      `<input id="swal-input1" class="swal2-input" placeholder="Usuario">` +
      `<input id="swal-input2" class="swal2-input" type="password" placeholder="Contraseña">`,
    focusConfirm: false,
    preConfirm: () => {
      const username = document.getElementById('swal-input1').value;
      const password = document.getElementById('swal-input2').value;
      if (!username || !password) {
        Swal.showValidationMessage(`Por favor, ingrese usuario y contraseña.`);
      }
      return { username: username, password: password };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const username = result.value.username;
      const password = result.value.password;

      if (username === USUARIO_ADMIN && password === CLAVE_ADMIN) {
        eliminarCliente(index);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Credenciales de administrador incorrectas.'
        });
      }
    }
  });
}

function eliminarCliente(index) {
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
   Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Eliminar a "${clientes[index].nombre}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            clientes.splice(index, 1);
            localStorage.setItem('clientes', JSON.stringify(clientes));
            cargarClientes();
            Swal.fire(
                'Eliminado!',
                'El cliente ha sido eliminado.',
                'success'
            );
        }
    });
        }
