// Datos de autenticación (usuario y contraseña)
const USUARIO_CORRECTO = "admin";
const CONTRASENA_CORRECTA = "1234";

document.addEventListener("DOMContentLoaded", function() {
    if (sessionStorage.getItem("usuarioAutenticado") === "true") {
        cambiarPantalla("inicio");
    }

    // Evento para el login
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        
        const usuario = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();

        if (usuario === USUARIO_CORRECTO && contrasena === CONTRASENA_CORRECTA) {
            alert("Inicio de sesión exitoso");
            sessionStorage.setItem("usuarioAutenticado", "true");
            cambiarPantalla("inicio");
        } else {
            alert("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
        }
    });
});

// Función para cambiar de pantalla y actualizar lista de clientes
function cambiarPantalla(pantalla) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activo"));
    document.getElementById(pantalla).classList.add("activo");

    if (pantalla === "lista") {
        cargarClientes(); // Cargar clientes al abrir la lista
    }
}

// Función para obtener la ubicación
function obtenerUbicacion() {
    if (!navigator.geolocation) {
        alert("La geolocalización no es soportada por tu navegador.");
        return;
    }

    alert("Obteniendo ubicación... por favor espera.");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = position.coords;
            document.getElementById("ubicacion").value = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
            alert("Ubicación obtenida correctamente.");
        },
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("Permiso denegado. Activa la ubicación en tu navegador.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("La ubicación no está disponible en este momento.");
                    break;
                case error.TIMEOUT:
                    alert("El tiempo de espera para obtener la ubicación se agotó.");
                    break;
                default:
                    alert(`Error al obtener ubicación: ${error.message}`);
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Guardar cliente en Firestore y actualizar lista
function guardarCliente() {
    const nombre = document.getElementById("nombre").value.trim();
    const cedula = document.getElementById("cedula").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const ubicacion = document.getElementById("ubicacion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    if (!nombre || !cedula || !direccion || !ubicacion || !telefono) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    db.collection("clientes").add({
        nombre,
        cedula,
        direccion,
        ubicacion,
        telefono
    })
    .then(() => {
        alert("Cliente registrado con éxito.");
        document.getElementById("clienteForm").reset();
        cambiarPantalla("lista"); // Ir a la lista automáticamente
        cargarClientes(); // Recargar lista de clientes
    })
    .catch(error => {
        console.error("Error al registrar cliente:", error);
    });
}

// Cargar clientes desde Firestore y mostrarlos en la lista
function cargarClientes() {
    const listaClientes = document.getElementById("listaClientes");
    listaClientes.innerHTML = "<p>Cargando clientes...</p>";

    db.collection("clientes").get().then((querySnapshot) => {
        listaClientes.innerHTML = ""; // Limpiar lista antes de agregar clientes

        if (querySnapshot.empty) {
            listaClientes.innerHTML = "<p>No hay clientes registrados.</p>";
        } else {
            querySnapshot.forEach(doc => {
                const cliente = doc.data();
                const divCliente = document.createElement("div");
                divCliente.classList.add("cliente");
                divCliente.innerHTML = `
                    <span>${cliente.nombre}</span>
                    <div>
                        <button class="btn-detalles" onclick="verDetalles('${doc.id}')">Detalles</button>
                        <button class="btn-eliminar" onclick="eliminarCliente('${doc.id}')">Eliminar</button>
                    </div>
                `;
                listaClientes.appendChild(divCliente);
            });
        }
    }).catch(error => {
        console.error("Error al cargar clientes:", error);
        listaClientes.innerHTML = "<p>Error al cargar los clientes.</p>";
    });
}

// Eliminar cliente
function eliminarCliente(id) {
    if (confirm("¿Eliminar este cliente?")) {
        db.collection("clientes").doc(id).delete().then(() => {
            alert("Cliente eliminado.");
            cargarClientes();
        }).catch(error => {
            console.error("Error al eliminar cliente:", error);
        });
    }
}

// Ver detalles del cliente
function verDetalles(id) {
    db.collection("clientes").doc(id).get().then(doc => {
        if (doc.exists) {
            const cliente = doc.data();
            alert(`Detalles:\nNombre: ${cliente.nombre}\nCédula: ${cliente.cedula}\nDirección: ${cliente.direccion}\nUbicación: ${cliente.ubicacion}\nTeléfono: ${cliente.telefono}`);
        } else {
            alert("Cliente no encontrado.");
        }
    });
}
