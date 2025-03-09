// Configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Manejo de Sesión
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                cambiarPantalla('inicio');
            });
        })
        .catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error de inicio de sesión',
                text: error.message
            });
        });
});

function cerrarSesion() {
    auth.signOut().then(() => {
        cambiarPantalla('login');
    }).catch((error) => {
        Swal.fire({
            icon: 'error',
            title: 'Error al cerrar sesión',
            text: error.message
        });
    });
}

// Guardar Cliente en Firestore
document.getElementById('clienteForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const clienteData = {
        nombre: document.getElementById('nombre').value.trim(),
        cedula: document.getElementById('cedula').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        ubicacion: document.getElementById('ubicacion').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("clientes-morosos").add(clienteData)
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Cliente registrado',
                timer: 1500,
                showConfirmButton: false
            });
            cambiarPantalla('lista');
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar cliente',
                text: error.message
            });
        });
});

// Cargar Clientes desde Firestore
function cargarClientes() {
    const listaClientes = document.getElementById("listaClientes");
    listaClientes.innerHTML = "<p>Cargando clientes...</p>";

    db.collection("clientes-morosos").orderBy("fechaRegistro", "desc").onSnapshot((querySnapshot) => {
        listaClientes.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const cliente = doc.data();
            const divCliente = document.createElement("div");
            divCliente.innerHTML = `
                <p><strong>${cliente.nombre}</strong></p>
                <p>${cliente.direccion} - ${cliente.telefono}</p>
                <button onclick="eliminarCliente('${doc.id}')">Eliminar</button>
            `;
            listaClientes.appendChild(divCliente);
        });
    });
}

// Eliminar Cliente en Firestore
function eliminarCliente(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            db.collection("clientes-morosos").doc(id).delete().then(() => {
                Swal.fire(
                    'Eliminado!',
                    'El cliente ha sido eliminado.',
                    'success'
                );
            }).catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar',
                    text: error.message
                });
            });
        }
    });
}

// Cambiar pantalla
function cambiarPantalla(pantalla) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activo"));
    document.getElementById(pantalla).classList.add("activo");

    if (pantalla === "lista") {
        cargarClientes();
    }
}
