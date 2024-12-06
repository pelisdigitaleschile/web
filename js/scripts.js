// Variables globales para el seguimiento del estado de ordenamiento
let lastSortedColumn = -1; // Almacena la última columna ordenada
let sortDirection = 'asc';  // Almacena la dirección actual del ordenamiento

/**
 * Actualiza los iconos de ordenamiento en la tabla
 * @param {number} column - Índice de la columna actual
 * @param {string} direction - Dirección del ordenamiento ('asc' o 'desc')
 */
function updateSortIcons(column, direction) {
    // Resetea todos los iconos a su estado inicial
    document.querySelectorAll('thead i.fas').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    // Actualiza el icono de la columna actualmente ordenada
    const currentIcon = document.querySelector(`thead i[data-column="${column}"]`);
    // Cambia el icono según la dirección del ordenamiento
    if (direction === 'asc') {
        currentIcon.className = 'fas fa-sort-up';    // Flecha hacia arriba
    } else {
        currentIcon.className = 'fas fa-sort-down';  // Flecha hacia abajo
    }
}

/**
 * Ordena la tabla por la columna especificada
 * @param {number} n - Índice de la columna a ordenar
 */
function sortTable(n) {
    var table = document.querySelector("table");
    var switching = true;

    // Determina la dirección del ordenamiento
    if (lastSortedColumn === n) {
        // Si es la misma columna, alterna la dirección
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // Si es una nueva columna, comienza con orden ascendente
        sortDirection = 'asc';
    }
    
    lastSortedColumn = n;  // Actualiza la última columna ordenada
    updateSortIcons(n, sortDirection);  // Actualiza los iconos
    
    // Proceso de ordenamiento de burbuja
    while (switching) {
        switching = false;
        var rows = table.rows;
        
        // Compara cada par de filas
        for (var i = 1; i < (rows.length - 1); i++) {
            var shouldSwitch = false;
            var x = rows[i].getElementsByTagName("TD")[n];
            var y = rows[i + 1].getElementsByTagName("TD")[n];
            
            // Determina el tipo de comparación según la columna
            let comparison;
            if (n === 0 || n === 2) { 
                // Para columnas numéricas (N° y Año)
                comparison = Number(x.innerHTML) - Number(y.innerHTML);
            } else {
                // Para columnas de texto
                comparison = x.innerHTML.toLowerCase().localeCompare(y.innerHTML.toLowerCase());
            }
            
            // Determina si se debe hacer el intercambio
            if (sortDirection === 'asc' ? comparison > 0 : comparison < 0) {
                shouldSwitch = true;
                break;
            }
        }
        
        // Realiza el intercambio si es necesario
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

/**
 * Muestra el modal con el trailer de YouTube
 * @param {string} videoId - ID del video de YouTube
 */
function showTrailer(videoId) {
    // Inicializa y muestra el modal de Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('trailerModal'));
    // Establece la URL del video
    document.getElementById('youtubeFrame').src = `https://www.youtube.com/embed/${videoId}`;
    modal.show();
    
    // Limpia la URL del iframe cuando se cierra el modal
    document.getElementById('trailerModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('youtubeFrame').src = '';
    });
}