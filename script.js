// script.js

// Aseguramos que el script se ejecute una vez que todo el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Referencias a Elementos del DOM ---
    const toggleDarkBtn = document.getElementById('toggleDark');
    const modeTextSpan = document.getElementById('modeText'); // El nuevo span para el texto "Modo Oscuro/Claro"
    const body = document.body;
    const searchInput = document.getElementById('searchInput');
    const seccionHeaders = document.querySelectorAll('.seccion-header'); // Encabezados de los acordeones
    const examenForm = document.getElementById('examenForm');
    const verResumenBtn = document.getElementById('verResumenBtn');
    const generarPdfBtn = document.getElementById('generarPdfBtn');
    const limpiarFormularioBtn = document.getElementById('limpiarFormularioBtn');
    const resumenModal = document.getElementById('resumenModal');
    const cerrarModalBtn = document.getElementById('cerrarModal');
    const contenidoResumenDiv = document.getElementById('contenidoResumen');
    const imprimirResumenBtn = document.getElementById('imprimirResumenBtn');
    const otrosExamenesTextarea = document.getElementById('otrosExamenes');

    // --- 2. Funcionalidad del Modo Oscuro ---

    // Carga la preferencia de modo oscuro desde localStorage al iniciar la página.
    // Esto permite que el modo oscuro persista entre sesiones.
    const prefersDarkMode = localStorage.getItem('darkMode') === 'true';
    if (prefersDarkMode) {
        body.classList.add('dark-mode');
        // Actualiza el icono y el texto del botón al cargar la página si el modo oscuro está activo
        toggleDarkBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        modeTextSpan.textContent = 'Modo Claro';
    } else {
        // Asegura que el texto inicial sea "Modo Oscuro" si el modo oscuro NO está activo.
        modeTextSpan.textContent = 'Modo Oscuro';
    }

    // Agrega un "escuchador de eventos" (event listener) al botón de modo oscuro.
    // Cuando el botón es clickeado, alterna entre los modos.
    toggleDarkBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode'); // Alterna la clase 'dark-mode' en el <body>
        const isDarkMode = body.classList.contains('dark-mode'); // Verifica el estado actual

        // Guarda la preferencia en localStorage para futuras visitas.
        localStorage.setItem('darkMode', isDarkMode);

        // Cambia el icono y el texto del botón según el modo actual.
        const icon = toggleDarkBtn.querySelector('i');
        if (isDarkMode) {
            icon.classList.replace('fa-moon', 'fa-sun'); // Cambia a icono de sol
            modeTextSpan.textContent = 'Modo Claro'; // Cambia el texto del botón
        } else {
            icon.classList.replace('fa-sun', 'fa-moon'); // Cambia a icono de luna
            modeTextSpan.textContent = 'Modo Oscuro'; // Cambia el texto del botón
        }
    });

    // --- 3. Funcionalidad de Búsqueda de Exámenes ---

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const allExamens = document.querySelectorAll('.examen-categoria-block .examen');

        // Itera sobre todos los exámenes para determinar su visibilidad
        allExamens.forEach(examen => {
            const examenName = examen.dataset.name ? examen.dataset.name.toLowerCase() : '';
            const categoryName = examen.closest('.examen-categoria-block').dataset.category.toLowerCase();
            const labelText = examen.querySelector('label') ? examen.querySelector('label').textContent.toLowerCase() : '';

            // Muestra el examen si coincide con el término de búsqueda en su nombre, categoría o texto de etiqueta
            if (examenName.includes(searchTerm) || categoryName.includes(searchTerm) || labelText.includes(searchTerm)) {
                examen.classList.add('visible');
            } else {
                examen.classList.remove('visible');
            }
        });

        // Oculta/muestra categorías enteras y ajusta acordeones según la búsqueda
        document.querySelectorAll('.examen-categoria-block').forEach(categoryBlock => {
            const visibleExamensInCategory = categoryBlock.querySelectorAll('.examen.visible').length;
            const totalExamensInCategory = categoryBlock.querySelectorAll('.examen').length;
            const seccionContenido = categoryBlock.querySelector('.seccion-contenido');
            const seccionHeader = categoryBlock.querySelector('.seccion-header');

            if (searchTerm === '') {
                // Si la búsqueda está vacía, mostrar todas las categorías y cerrar sus acordeones
                categoryBlock.style.display = '';
                seccionContenido.classList.add('seccion-cerrada');
                seccionHeader.classList.add('cerrado');
                seccionContenido.style.maxHeight = '0';
            } else {
                // Si hay un término de búsqueda, mostrar la categoría si tiene exámenes visibles, sino ocultarla
                if (visibleExamensInCategory > 0) {
                    categoryBlock.style.display = '';
                    // Expandir la sección si tiene ítems visibles para la búsqueda
                    seccionContenido.classList.remove('seccion-cerrada');
                    seccionHeader.classList.remove('cerrado');
                    seccionContenido.style.maxHeight = seccionContenido.scrollHeight + "px";
                } else {
                    categoryBlock.style.display = 'none'; // Ocultar la categoría si no hay coincidencias
                    seccionContenido.classList.add('seccion-cerrada'); // Asegura que esté colapsada
                    seccionHeader.classList.add('cerrado');
                    seccionContenido.style.maxHeight = '0';
                }
            }
        });

        // Asegura que la sección de "Otros Exámenes" siempre sea visible si el campo de texto tiene contenido
        const otrosExamenesBlock = document.querySelector('.otros-examenes-block');
        if (otrosExamenesBlock) {
            // Muestra el bloque si hay texto en el textarea O si la búsqueda está vacía
            if (otrosExamenesTextarea.value.trim() !== '' || searchTerm === '') {
                otrosExamenesBlock.style.display = '';
            } else {
                otrosExamenesBlock.style.display = 'none';
            }
        }
    });

    // --- 4. Funcionalidad de Acordeones (Colapsar/Expandir Categorías) ---

    // Agrega listeners a cada encabezado de sección para alternar el contenido
    seccionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const seccionContenido = header.nextElementSibling; // El div de contenido después del encabezado
            // Alterna las clases para controlar el estado de cerrado/abierto y la rotación de la flecha
            seccionContenido.classList.toggle('seccion-cerrada');
            header.classList.toggle('cerrado');

            // Ajusta la altura máxima para animar la apertura y cierre
            if (seccionContenido.classList.contains('seccion-cerrada')) {
                seccionContenido.style.maxHeight = '0';
            } else {
                seccionContenido.style.maxHeight = seccionContenido.scrollHeight + "px";
            }
        });
    });

    // Asegura que todas las secciones estén colapsadas al cargar la página
    seccionHeaders.forEach(header => {
        const seccionContenido = header.nextElementSibling;
        seccionContenido.classList.add('seccion-cerrada'); // Añade la clase de cerrado
        header.classList.add('cerrado'); // Añade la clase para la flecha
        seccionContenido.style.maxHeight = '0'; // Establece la altura a 0 para el cierre visual
    });


    // --- 5. Funcionalidad del Formulario y Modal de Resumen ---

    verResumenBtn.addEventListener('click', generarResumen);
    generarPdfBtn.addEventListener('click', () => generarPdf(false)); // 'false' indica no imprimir directamente
    imprimirResumenBtn.addEventListener('click', () => generarPdf(true)); // 'true' indica imprimir directamente
    limpiarFormularioBtn.addEventListener('click', limpiarFormulario);
    cerrarModalBtn.addEventListener('click', () => resumenModal.style.display = 'none');

    // Cierra el modal si se hace clic fuera de su contenido
    resumenModal.addEventListener('click', (event) => {
        if (event.target === resumenModal) {
            resumenModal.style.display = 'none';
        }
    });

    // Función para generar el contenido HTML del resumen
    function generarResumen() {
        let resumenHTML = '';

        // 1. Recopilación de Datos del Médico y Paciente
        const medicoNombre = document.getElementById('medico').value.trim();
        const medicoLugar = document.getElementById('lugar').value.trim();
        const fechaSolicitud = document.getElementById('fecha').value.trim();
        const pacienteNombre = document.getElementById('paciente').value.trim();
        const pacienteCedula = document.getElementById('cedula').value.trim();
        const pacienteDireccion = document.getElementById('direccion').value.trim();

        // Construye el HTML para los datos del médico y paciente
        resumenHTML += `
            <div class="resumen-seccion">
                <h3>Datos del Médico y Paciente</h3>
                <p><strong>Médico:</strong> ${medicoNombre || 'No especificado'}</p>
                <p><strong>Lugar de Trabajo:</strong> ${medicoLugar || 'No especificado'}</p>
                <p><strong>Fecha de Solicitud:</strong> ${fechaSolicitud || 'No especificada'}</p>
                <p><strong>Paciente:</strong> ${pacienteNombre || 'No especificado'}</p>
                <p><strong>Cédula:</strong> ${pacienteCedula || 'No especificada'}</p>
                <p><strong>Dirección:</strong> ${pacienteDireccion || 'No especificada'}</p>
            </div>
        `;

        // 2. Recopilación de Exámenes Seleccionados por Categoría
        const categorias = document.querySelectorAll('.examen-categoria-block');
        categorias.forEach(categoria => {
            const categoriaNombre = categoria.dataset.category;
            // Busca solo los checkboxes marcados dentro de esta categoría
            const examenesSeleccionados = categoria.querySelectorAll('.examen input[type="checkbox"]:checked');

            if (examenesSeleccionados.length > 0) {
                // Si hay exámenes seleccionados en esta categoría, añade un encabezado y una lista
                resumenHTML += `
                    <div class="resumen-seccion">
                        <h3>Exámenes de ${categoriaNombre}</h3>
                        <ul>
                `;
                examenesSeleccionados.forEach(checkbox => {
                    const label = checkbox.nextElementSibling; // El elemento <label> asociado al checkbox
                    resumenHTML += `<li>${label.textContent}</li>`; // Añade el texto del examen a la lista
                });
                resumenHTML += `
                        </ul>
                    </div>
                `;
            }
        });

        // 3. Recopilación de Otros Exámenes (del textarea)
        const otrosExamenes = otrosExamenesTextarea.value.trim();
        if (otrosExamenes) {
            resumenHTML += `
                <div class="resumen-seccion">
                    <h3>Otros Exámenes Solicitados</h3>
                    <p>${otrosExamenes}</p>
                </div>
            `;
        }

        // Inserta el HTML generado en el div del contenido del resumen en el modal
        contenidoResumenDiv.innerHTML = resumenHTML;
        resumenModal.style.display = 'flex'; // Muestra el modal (usamos flex para centrado CSS)
    }

    // Función para generar y/o imprimir el PDF del resumen
    function generarPdf(printImmediately) {
        // Selecciona el contenido del modal que queremos convertir a PDF.
        // Se selecciona '.modal-contenido' porque contiene el encabezado de Nival Sciences y el resumen.
        const element = document.getElementById('resumenModal').querySelector('.modal-contenido');

        // Clona el elemento para manipularlo sin afectar la visualización actual del modal.
        const clonedElement = element.cloneNode(true);
        
        // Oculta los botones del modal clonado para que no aparezcan en el PDF.
        const clonedCerrarBtn = clonedElement.querySelector('.cerrar-modal');
        if (clonedCerrarBtn) clonedCerrarBtn.style.display = 'none';

        const clonedModalBtns = clonedElement.querySelector('.modal-botones');
        if (clonedModalBtns) clonedModalBtns.style.display = 'none';

        // Opcional: Ajusta estilos específicos para la impresión si es necesario.
        // Por ejemplo, el tamaño del logo y el texto del encabezado "NIVAL SCIENCES" para el PDF.
        const logoImg = clonedElement.querySelector('#encabezadoImpresion img');
        if (logoImg) {
            logoImg.style.height = '60px'; // Tamaño del logo en el PDF
            logoImg.style.width = 'auto'; // Mantiene la proporción
        }
        const nivalSciencesH1 = clonedElement.querySelector('#encabezadoImpresion h1');
        if (nivalSciencesH1) nivalSciencesH1.style.fontSize = '1.8rem'; // Tamaño del título principal en el PDF
        
        const nivalSciencesP = clonedElement.querySelectorAll('#encabezadoImpresion p');
        nivalSciencesP.forEach(p => p.style.fontSize = '0.9rem'); // Tamaño de los párrafos en el PDF

        // Configuración para html2pdf
        const options = {
            margin: [20, 20, 20, 20], // Márgenes [top, left, bottom, right] en mm
            filename: `Petitorio_Examenes_${document.getElementById('paciente').value.trim() || 'Paciente'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
            pagebreak: { avoid: ['h3', '.resumen-seccion'] } // Evita cortes bruscos en títulos y secciones del resumen
        };

        // Genera el PDF usando html2pdf
        html2pdf().set(options).from(clonedElement).outputPdf().then(pdf => {
            if (printImmediately) {
                // Si se solicita imprimir inmediatamente, abre el PDF en una nueva ventana/pestaña
                const blob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const win = window.open(url, '_blank');
                win.onload = () => {
                    win.print(); // Dispara el diálogo de impresión
                    URL.revokeObjectURL(url); // Libera la URL del objeto después de la impresión
                };
            } else {
                // Si no se solicita imprimir, guarda el PDF directamente
                pdf.save();
            }
        });
    }

    // Función para limpiar todos los campos del formulario
    function limpiarFormulario() {
        examenForm.reset(); // Reinicia todos los inputs, textareas y checkboxes del formulario
        otrosExamenesTextarea.value = ''; // Asegura que el textarea "Otros Exámenes" también se borre

        // Colapsa todas las secciones de exámenes y muestra todos los ítems de examen
        seccionHeaders.forEach(header => {
            const seccionContenido = header.nextElementSibling;
            seccionContenido.classList.add('seccion-cerrada');
            header.classList.add('cerrado');
            seccionContenido.style.maxHeight = '0'; // Asegura que la altura sea 0
        });

        // Asegura que todos los exámenes y categorías sean visibles después de limpiar la búsqueda
        document.querySelectorAll('.examen').forEach(examen => {
            examen.classList.add('visible'); // Asegura que todos los exámenes estén visibles
        });
        document.querySelectorAll('.examen-categoria-block').forEach(categoryBlock => {
            categoryBlock.style.display = ''; // Asegura que todas las categorías estén visibles
        });

        searchInput.value = ''; // Limpia el campo de búsqueda
        // Dispara el evento 'input' en el campo de búsqueda para restablecer completamente las vistas
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
    }
});