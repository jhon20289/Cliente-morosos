// Importar módulos de Firebase (para Firebase 9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Manejo de Sesión
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    console.log("Intentando iniciar sesión con:", email);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Usuario autenticado:", userCredential.user);

        Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            cambiarPantalla('inicio');
        });

    } catch (error) {
        console.error("Error de autenticación:", error.code, error.message);

        let mensajeError = "Error desconocido al iniciar sesión.";
        if (error.code === "auth/user-not-found") {
            mensajeError = "El usuario no existe.";
        } else if (error.code === "auth/wrong-password") {
            mensajeError = "Contraseña incorrecta.";
        } else if (error.code === "auth/invalid-email") {
            mensajeError = "Correo electrónico inválido.";
        }

        Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: mensajeError
        });
    }
});

function cerrarSesion() {
    signOut(auth).then(() => {
        console.log("Usuario cerró sesión");
        cambiarPantalla('login');
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cerrar sesión',
            text: error.message
        });
    });
}

// Guardar Cliente en Firestore
document.getElementById('clienteForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const clienteData = {
        nombre: document.getElementById('nombre').value.trim(),
        cedula: document.getElementById('cedula').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        ubicacion: document.getElementById('ubicacion').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        fechaRegistro: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "clientes-morosos"), clienteData);
        Swal.fire({
            icon: 'success',
            title: 'Cliente registrado',
            timer: 1500,
            showConfirmButton: false
        });
        cambiarPantalla('lista');
    } catch (error) {
        console.error("Error al guardar cliente:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al guardar cliente',
            text: error.message
        });
    }
});

// Cargar Clientes desde Firestore en tiempo real
function cargarClientes() {
    const listaClientes = document.getElementById("listaClientes");
    listaClientes.innerHTML = "<p>Cargando clientes...</p>";

    onSnapshot(collection(db, "clientes-morosos"), (querySnapshot) => {
        listaClientes.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const cliente = doc.data();
            const divCliente = document.createElement("div");
            divCliente.classList.add("cliente");
            divCliente.innerHTML = `
                <p><strong>${cliente.nombre}</strong></p>
                <p>${cliente.direccion} - ${cliente.telefono}</p>
                <button class="btn-eliminar" onclick="eliminarCliente('${doc.id}')">Eliminar</button>
            `;
            listaClientes.appendChild(divCliente);
        });
    });
}

// Eliminar Cliente en Firestore
async function eliminarCliente(id) {
    try {
        await deleteDoc(doc(db, "clientes-morosos", id));
        Swal.fire(
            'Eliminado!',
            'El cliente ha sido eliminado.',
            'success'
        );
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: error.message
        });
    }
}

// Cambiar pantalla
function cambiarPantalla(pantalla) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activo"));
    document.getElementById(pantalla).classList.add("activo");

    if (pantalla === "lista") {
        cargarClientes();
    }
}
