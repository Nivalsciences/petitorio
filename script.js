// script.js

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Referencias a Elementos del DOM ---
  const toggleDarkBtn = document.getElementById('toggleDark');
  const body = document.body;
  const searchInput = document.getElementById('searchInput');
  const seccionHeaders = document.querySelectorAll('.seccion-header');
  const examenForm = document.getElementById('examenForm');
  const verResumenBtn = document.getElementById('verResumenBtn');
  const generarPdfBtn = document.getElementById('generarPdfBtn');
  const limpiarFormularioBtn = document.getElementById('limpiarFormularioBtn');
  const resumenModal = document.getElementById('resumenModal');
  const cerrarModalBtn = document.getElementById('cerrarModal');
  const contenidoResumenDiv = document.getElementById('contenidoResumen');
  const imprimirResumenBtn = document.getElementById('imprimirResumenBtn');
  const otrosExamenesTextarea = document.getElementById('otrosExamenes');
  const fechaInput = document.getElementById('fecha');

  // --- 2. Establecer fecha actual por defecto ---
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.value = hoy;
  }

  // --- 3. Modo Oscuro ---
  const prefersDarkMode = localStorage.getItem('darkMode') === 'true';
  if (prefersDarkMode) {
    body.classList.add('dark-mode');
    toggleDarkBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
  }

  toggleDarkBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);

    const icon = toggleDarkBtn.querySelector('i');
    if (isDarkMode) {
      icon.classList.replace('fa-moon', 'fa-sun');
    } else {
      icon.classList.replace('fa-sun', 'fa-moon');
    }
  });

  // --- 4. Búsqueda ---
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const allExamens = document.querySelectorAll('.examen-categoria-block .examen');

    allExamens.forEach(examen => {
      const examenName = examen.dataset.name?.toLowerCase() || '';
      const categoryName = examen.closest('.examen-categoria-block').dataset.category.toLowerCase();
      const labelText = examen.querySelector('label')?.textContent.toLowerCase() || '';
      if (examenName.includes(searchTerm) || categoryName.includes(searchTerm) || labelText.includes(searchTerm)) {
        examen.classList.add('visible');
      } else {
        examen.classList.remove('visible');
      }
    });

    document.querySelectorAll('.examen-categoria-block').forEach(categoryBlock => {
      const visibleExamens = categoryBlock.querySelectorAll('.examen.visible').length;
      const seccionContenido = categoryBlock.querySelector('.seccion-contenido');
      const seccionHeader = categoryBlock.querySelector('.seccion-header');

      if (searchTerm === '') {
        categoryBlock.style.display = '';
        seccionContenido.classList.add('seccion-cerrada');
        seccionHeader.classList.add('cerrado');
        seccionContenido.style.maxHeight = '0';
      } else {
        if (visibleExamens > 0) {
          categoryBlock.style.display = '';
          seccionContenido.classList.remove('seccion-cerrada');
          seccionHeader.classList.remove('cerrado');
          seccionContenido.style.maxHeight = seccionContenido.scrollHeight + "px";
        } else {
          categoryBlock.style.display = 'none';
          seccionContenido.classList.add('seccion-cerrada');
          seccionHeader.classList.add('cerrado');
          seccionContenido.style.maxHeight = '0';
        }
      }
    });

    const otrosExamenesBlock = document.querySelector('.otros-examenes-block');
    if (otrosExamenesBlock) {
      if (otrosExamenesTextarea.value.trim() !== '' || searchTerm === '') {
        otrosExamenesBlock.style.display = '';
      } else {
        otrosExamenesBlock.style.display = 'none';
      }
    }
  });

  // --- 5. Acordeones ---
  seccionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const seccionContenido = header.nextElementSibling;
      seccionContenido.classList.toggle('seccion-cerrada');
      header.classList.toggle('cerrado');
      if (seccionContenido.classList.contains('seccion-cerrada')) {
        seccionContenido.style.maxHeight = '0';
      } else {
        seccionContenido.style.maxHeight = seccionContenido.scrollHeight + "px";
      }
    });
  });

  seccionHeaders.forEach(header => {
    const seccionContenido = header.nextElementSibling;
    seccionContenido.classList.add('seccion-cerrada');
    header.classList.add('cerrado');
    seccionContenido.style.maxHeight = '0';
  });

  // --- 6. Modal de Resumen ---
  verResumenBtn.addEventListener('click', generarResumen);
  generarPdfBtn.addEventListener('click', () => generarPdf(false));
  imprimirResumenBtn.addEventListener('click', () => generarPdf(true));
  limpiarFormularioBtn.addEventListener('click', limpiarFormulario);
  cerrarModalBtn.addEventListener('click', () => resumenModal.style.display = 'none');

  resumenModal.addEventListener('click', (event) => {
    if (event.target === resumenModal) {
      resumenModal.style.display = 'none';
    }
  });

  function generarResumen() {
    let resumenHTML = '';

    const medicoNombre = document.getElementById('medico').value.trim();
    const medicoLugar = document.getElementById('lugar').value.trim();
    const fechaSolicitud = fechaInput.value.trim();
    const pacienteNombre = document.getElementById('paciente').value.trim();
    const pacienteCedula = document.getElementById('cedula').value.trim();
    const pacienteDireccion = document.getElementById('direccion').value.trim();

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

    const categorias = document.querySelectorAll('.examen-categoria-block');
    categorias.forEach(categoria => {
      const categoriaNombre = categoria.dataset.category;
      const examenesSeleccionados = categoria.querySelectorAll('.examen input[type="checkbox"]:checked');
      if (examenesSeleccionados.length > 0) {
        resumenHTML += `
          <div class="resumen-seccion">
            <h3>Exámenes de ${categoriaNombre}</h3>
            <ul>
        `;
        examenesSeleccionados.forEach(checkbox => {
          const label = checkbox.nextElementSibling;
          resumenHTML += `<li>${label.textContent}</li>`;
        });
        resumenHTML += `</ul></div>`;
      }
    });

    const otrosExamenes = otrosExamenesTextarea.value.trim();
    if (otrosExamenes) {
      resumenHTML += `
        <div class="resumen-seccion">
          <h3>Otros Exámenes Solicitados</h3>
          <p>${otrosExamenes}</p>
        </div>
      `;
    }

    contenidoResumenDiv.innerHTML = resumenHTML;
    resumenModal.style.display = 'flex';
  }

  function generarPdf(printImmediately) {
    const element = document.getElementById('resumenModal').querySelector('.modal-contenido');
    const clonedElement = element.cloneNode(true);

    const clonedCerrarBtn = clonedElement.querySelector('.cerrar-modal');
    if (clonedCerrarBtn) clonedCerrarBtn.style.display = 'none';
    const clonedModalBtns = clonedElement.querySelector('.modal-botones');
    if (clonedModalBtns) clonedModalBtns.style.display = 'none';

    const logoImg = clonedElement.querySelector('#encabezadoImpresion img');
    if (logoImg) {
      logoImg.style.height = '60px';
      logoImg.style.width = 'auto';
    }

    const nivalSciencesH1 = clonedElement.querySelector('#encabezadoImpresion h1');
    if (nivalSciencesH1) {
      nivalSciencesH1.style.fontSize = '1.8rem';
    }

    const nivalSciencesP = clonedElement.querySelectorAll('#encabezadoImpresion p');
    nivalSciencesP.forEach(p => {
      p.style.fontSize = '0.9rem';
    });

    const options = {
      margin: [20, 20, 20, 20],
      filename: `Petitorio_Examenes_${document.getElementById('paciente').value.trim() || 'Paciente'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
      pagebreak: { avoid: ['h3', '.resumen-seccion'] }
    };

    html2pdf().set(options).from(clonedElement).outputPdf().then(pdf => {
      if (printImmediately) {
        const blob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        win.onload = () => {
          win.print();
          URL.revokeObjectURL(url);
        };
      } else {
        pdf.save();
      }
    });
  }

  function limpiarFormulario() {
    examenForm.reset();
    otrosExamenesTextarea.value = '';

    seccionHeaders.forEach(header => {
      const seccionContenido = header.nextElementSibling;
      seccionContenido.classList.add('seccion-cerrada');
      header.classList.add('cerrado');
      seccionContenido.style.maxHeight = '0';
    });

    document.querySelectorAll('.examen').forEach(examen => {
      examen.classList.add('visible');
    });

    document.querySelectorAll('.examen-categoria-block').forEach(categoryBlock => {
      categoryBlock.style.display = '';
    });

    searchInput.value = '';
    const event = new Event('input', { bubbles: true });
    searchInput.dispatchEvent(event);

    if (fechaInput) {
      const hoy = new Date().toISOString().split('T')[0];
      fechaInput.value = hoy;
    }
  }
});
