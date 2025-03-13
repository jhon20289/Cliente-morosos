<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>App con Supabase</title>
  <!-- Importa Supabase y SweetAlert2 -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/supabase.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <style>
    .pantalla { display: none; }
    .pantalla.activo { display: block; }
  </style>
</head>
<body>
  <!-- Pantalla de Login -->
  <div id="login" class="pantalla">
    <h2>Iniciar Sesión</h2>
    <form id="loginForm">
      <input type="text" id="username" placeholder="Usuario" required>
      <input type="password" id="password" placeholder="Contraseña" required>
      <button type="submit">Entrar</button>
    </form>
  </div>

  <!-- Pantalla de Inicio -->
  <div id="inicio" class="pantalla">
    <h2>Bienvenido</h2>
    <button onclick="cerrarSesion()">Cerrar Sesión</button>
    <button onclick="cambiarPantalla('cliente')">Registrar Cliente</button>
    <button onclick="cambiarPantalla('lista')">Ver Clientes</button>
  </div>

  <!-- Pantalla para Registrar Cliente -->
  <div id="cliente" class="pantalla">
    <h2>Registrar Cliente</h2>
    <form id="clienteForm">
      <input type="text" id="nombre" placeholder="Nombre" required>
      <input type="text" id="cedula" placeholder="Cédula" required>
      <input type="text" id="direccion" placeholder="Dirección" required>
      <input type="text" id="ubicacion" placeholder="Ubicación" required>
      <input type="text" id="telefono" placeholder="Teléfono" required>
      <button type="submit">Guardar Cliente</button>
    </form>
    <button onclick="cambiarPantalla('inicio')">Volver</button>
  </div>

  <!-- Pantalla de Lista de Clientes -->
  <div id="lista" class="pantalla">
    <h2>Lista de Clientes</h2>
    <div id="listaClientes"></div>
    <button onclick="cambiarPantalla('inicio')">Volver</button>
  </div>

  <script>
    // Configuración sin datos sensibles: reemplaza estos valores por los de tu proyecto
    const SUPABASE_URL = 'TU_SUPABASE_URL';
    const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';

    // Inicializar Supabase
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

      let { data, error } = await supabaseClient
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

      const { error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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

    // Función para ver detalles (pendiente de implementar)
    function verDetalles(id) {
      Swal.fire('Detalles', 'Función en desarrollo para el cliente con ID: ' + id, 'info');
    }

    // Cambiar de pantalla
    function cambiarPantalla(pantalla) {
      document.querySelectorAll('.pantalla').forEach(div => div.classList.remove('activo'));
      document.getElementById(pantalla).classList.add('activo');
    }
  </script>
</body>
</html>
