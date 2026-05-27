
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function obtenerValor(obj, ruta) {
  return ruta.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function exportarPDF({
  titulo,
  subtitulo = '',
  filas,
  columnas,
  nombreArchivo,
  orientacion = 'landscape',
}) {

  const doc = new jsPDF({
    orientation: orientacion,
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(40, 61, 97); // #283d61
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, 'F');

  // Texto del título en blanco
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


  doc.setTextColor(60, 60, 60);
  if (subtitulo) {
    doc.setFontSize(10);
    doc.text(subtitulo, 14, 30);
  }

  const head = [columnas.map((c) => c.etiqueta)];

  const body = filas.map((fila) =>
    columnas.map((c) => {
      const bruto = obtenerValor(fila, c.clave);
      const valor = c.formato ? c.formato(bruto, fila) : bruto;
      return valor == null ? '' : String(valor);
    })
  );


  const columnStyles = {};
  columnas.forEach((c, i) => {
    if (c.ancho) columnStyles[i] = { cellWidth: c.ancho };
  });

  autoTable(doc, {
    head,
    body,
    startY: subtitulo ? 35 : 28,
    theme: 'striped',
    headStyles: {
      fillColor: [40, 61, 97],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [243, 246, 251],
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

  doc.save(nombreArchivo);
}
