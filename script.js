// Función para obtener la ubicación con permisos correctos
function obtenerUbicacion() {
    if (!navigator.geolocation) {
        alert('La geolocalización no es soportada por tu navegador.');
        return;
    }

    // Mostrar mensaje de espera
    alert("Obteniendo ubicación... por favor espera.");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = position.coords;
            const ubicacionTexto = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
            
            // Insertar las coordenadas en el input
            document.getElementById('ubicacion').value = ubicacionTexto;

            alert('Ubicación obtenida correctamente.');
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
            enableHighAccuracy: true,  // Mayor precisión
            timeout: 10000,  // 10 segundos máximo
            maximumAge: 0  // No usar caché
        }
    );
}
