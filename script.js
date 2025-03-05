const USUARIO_ADMIN = "admin";
const CLAVE_ADMIN = "7531";

// URL base de la API de JSON Server
const API_URL = 'http://localhost:3000/clientes';

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

// Función para generar un ID único (puedes usar una librería UUID si lo prefieres)
function generarIdUnico() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}


async function guardarCliente() {
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

async function guardarClienteFinal(nombre, cedula, direccion, ubicacion, telefono, fotos) {
    const id = generarIdUnico(); // Genera un ID único para el cliente
    const clienteData = { id, nombre, cedula, direccion, ubicacion, telefono, fotos };

    try {
        const response = await fetch(API_URL, { // Usa la URL de la API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteData)
        });

        if (response.ok) {
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
        } else {
            console.error('Error al guardar cliente:', response.status);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el cliente. Verifica que JSON Server esté en ejecución.',
            });
        }
    } catch (error) {
        console.error('Error al guardar cliente:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al conectar con el servidor. Verifica que JSON Server esté en ejecución.',
        });
    }
}

async function cargarClientes() {
    try {
        const response = await fetch(API_URL); // Usa la URL de la API
        const clientes = await response.json();

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
                        <button class="btn-detalles" onclick="verDetalles('${cliente.id}')">Detalles</button>
                        <button class="btn-editar" onclick="editarCliente('${cliente.id}')">Editar</button>
                        <button class="btn-eliminar" onclick="confirmarEliminarCliente('${cliente.id}')">Eliminar</button>
                    </div>
                `;
                listaClientes.appendChild(divCliente);
            });
        }
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los clientes. Verifica que JSON Server esté en ejecución.',
        });
    }
}

function buscarClientes() {
    const query = document.getElementById('buscarCliente').value.toLowerCase();
    //No busca los clientes ahora

    const listaClientes = document.getElementById('listaClientes');
    listaClientes.innerHTML = '';
    cargarClientes()

}

async function verDetalles(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`); // Usa la URL de la API con el ID
        const cliente = await response.json();

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
        fotosCliente.innerHTML = ''; // Limpia el contenido anterior

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
    } catch (error) {
        console.error('Error al cargar detalles del cliente:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los detalles del cliente. Verifica que JSON Server esté en ejecución.',
        });
    }
}


async function editarCliente(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const cliente = await response.json();
    
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('cedula').value = cliente.cedula;
        document.getElementById('direccion').value = cliente.direccion;
        document.getElementById('ubicacion').value = cliente.ubicacion;
        document.getElementById('telefono').value = cliente.telefono;
    
        // Almacena el ID del cliente que se está editando
        document.getElementById('clienteForm').dataset.clienteId = id;
    
        cambiarPantalla('registro');
    
        // Modifica el evento submit del formulario para actualizar el cliente
        const formCliente = document.getElementById('clienteForm');
        formCliente.removeEventListener('submit', guardarCliente); // Elimina el evento anterior
        formCliente.addEventListener('submit', function(event) {
            event.preventDefault();
            actualizarCliente(id); // Llama a la función actualizarCliente con el ID
        });
    }
        catch (error) {
            console.error('Error al cargar los datos del cliente:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los datos del cliente.',
              });
        }
}
  
  // Nueva función para actualizar el cliente
  async function actualizarCliente(id) {
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
                    actualizarClienteFinal(id,nombre, cedula, direccion, ubicacion, telefono, fotos);
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        actualizarClienteFinal(id,nombre, cedula, direccion, ubicacion, telefono, fotos);
    }
}

async function actualizarClienteFinal(id,nombre, cedula, direccion, ubicacion, telefono, fotos) {
    
    const clienteData = { id, nombre, cedula, direccion, ubicacion, telefono, fotos };
    
      try {
          const response = await fetch(`${API_URL}/${id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(clienteData)
          });
  
          if (response.ok) {
              Swal.fire({
                  icon: 'success',
                  title: 'Cliente actualizado',
                  text: 'Cliente actualizado con éxito.',
                  timer: 1500,
                  showConfirmButton: false
              });
              document.getElementById('clienteForm').reset();
              document.getElementById('preview').innerHTML = '';
              cargarClientes();
              cambiarPantalla('lista');
          } else {
              console.error('Error al actualizar cliente:', response.status);
              Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Error al actualizar el cliente. Verifica que JSON Server esté en ejecución.',
              });
          }
      } catch (error) {
          console.error('Error al actualizar cliente:', error);
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al conectar con el servidor. Verifica que JSON Server esté en ejecución.',
          });
      }
  }

  async function confirmarEliminarCliente(id) {
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
          eliminarCliente(id);
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

  async function eliminarCliente(id) {
    Swal.fire({
         title: '¿Estás seguro?',
         text: `¿Eliminar a el cliente con Id"${id}"?`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#3085d6',
         cancelButtonColor: '#d33',
         confirmButtonText: 'Sí, eliminar!',
         cancelButtonText: 'Cancelar'
     }).then(async (result) => {
         if (result.isConfirmed) {
           try {
             const response = await fetch(`${API_URL}/${id}`, {
               method: 'DELETE',
             });
     
             if (response.ok) {
               Swal.fire(
                 'Eliminado!',
                 'El cliente ha sido eliminado.',
                 'success'
               );
               cargarClientes();
             } else {
               console.error('Error al eliminar el cliente:', response.status);
               Swal.fire({
                 icon: 'error',
                 title: 'Error',
                 text: 'Error al eliminar el cliente. Por favor, inténtalo de nuevo más tarde.',
               });
             }
           } catch (error) {
             console.error('Error al eliminar el cliente:', error);
             Swal.fire({
               icon: 'error',
               title: 'Error',
               text: 'Error al conectar con el servidor.',
             });
           }
         }
       });
}
