// src/lib/exportarPDF.js
// -------------------------------------------------------
// Utilidad para generar y descargar archivos PDF a partir
// de una lista de datos. Incluye cabecera con título,
// fecha de generación y tabla con bordes y zebra striping.
//
// Usa jsPDF + jspdf-autotable, dos librerías muy populares
// en JavaScript que generan PDFs en el navegador sin
// necesidad de servidor.
//
// Uso:
//   exportarPDF({
//     titulo: 'Listado de afiliados',
//     subtitulo: '8 afiliados activos',
//     filas: [...],
//     columnas: [
//       { clave: 'dni',    etiqueta: 'DNI' },
//       { clave: 'nombre', etiqueta: 'Nombre' },
//     ],
//     nombreArchivo: 'afiliados.pdf',
//   });
// -------------------------------------------------------

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Obtiene un valor anidado del objeto usando notación con puntos:
 *   obtenerValor(obj, 'sector.nombre')
 */
function obtenerValor(obj, ruta) {
  return ruta.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/**
 * Genera un PDF con cabecera y tabla, y lo descarga.
 *
 * @param {object} opciones
 * @param {string} opciones.titulo         Título principal del informe
 * @param {string} opciones.subtitulo      Texto secundario (resumen, número de filas...)
 * @param {Array<object>} opciones.filas   Datos a mostrar en la tabla
 * @param {Array<{clave:string, etiqueta:string, formato?:Function, ancho?:number}>} opciones.columnas
 *        Definición de columnas
 * @param {string} opciones.nombreArchivo  Nombre del archivo final (con .pdf)
 * @param {string} [opciones.orientacion]  'portrait' (vertical) o 'landscape' (horizontal). Default 'landscape'.
 */
export function exportarPDF({
  titulo,
  subtitulo = '',
  filas,
  columnas,
  nombreArchivo,
  orientacion = 'landscape',
}) {
  // 1. Crear documento PDF en formato A4
  const doc = new jsPDF({
    orientation: orientacion,
    unit: 'mm',
    format: 'a4',
  });

  // ------ CABECERA ------
  // Banda superior con color azul institucional
  doc.setFillColor(40, 61, 97); // #283d61
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, 'F');

  // Texto del título en blanco sobre la banda
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Portal Sindical', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo, 14, 18);

  // Fecha de generación a la derecha
  const fecha = new Date().toLocaleString('es-ES');
  doc.setFontSize(9);
  doc.text(`Generado: ${fecha}`,
    doc.internal.pageSize.getWidth() - 14, 12,
    { align: 'right' });

  // ------ SUBTÍTULO ------
  doc.setTextColor(60, 60, 60);
  if (subtitulo) {
    doc.setFontSize(10);
    doc.text(subtitulo, 14, 30);
  }

  // ------ TABLA ------
  const head = [columnas.map((c) => c.etiqueta)];

  const body = filas.map((fila) =>
    columnas.map((c) => {
      const bruto = obtenerValor(fila, c.clave);
      const valor = c.formato ? c.formato(bruto, fila) : bruto;
      return valor == null ? '' : String(valor);
    })
  );

  // Configuración de anchos de columna si se han indicado
  const columnStyles = {};
  columnas.forEach((c, i) => {
    if (c.ancho) columnStyles[i] = { cellWidth: c.ancho };
  });

  autoTable(doc, {
    head,
    body,
    startY: subtitulo ? 35 : 28,
    theme: 'striped',                       // alterna colores
    headStyles: {
      fillColor: [40, 61, 97],              // mismo azul que la cabecera
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [243, 246, 251],           // gris muy claro
    },
    columnStyles,
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Pie de página con número de página
      const numPagina = doc.internal.getNumberOfPages();
      const totalPaginas = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${numPagina} de ${totalPaginas}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'center' },
      );
    },
  });

  // Si la tabla está vacía, escribir mensaje
  if (filas.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text(
      'No hay datos que mostrar.',
      doc.internal.pageSize.getWidth() / 2,
      60,
      { align: 'center' },
    );
  }

  // ------ DESCARGAR ------
  doc.save(nombreArchivo);
}
