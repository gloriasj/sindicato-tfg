// src/lib/exportarCSV.js
// -------------------------------------------------------
// Convierte una lista de objetos a un archivo CSV y lo
// descarga directamente desde el navegador. Sin librerías
// externas: usa la API Blob estándar del navegador.
//
// Uso:
//   exportarCSV(
//     'afiliados.csv',
//     [{ nombre: 'Marta', dni: '12345678Z' }, ...],
//     [
//       { clave: 'nombre', etiqueta: 'Nombre' },
//       { clave: 'dni',    etiqueta: 'DNI' },
//     ],
//   );
// -------------------------------------------------------

/**
 * Escapa un valor para que sea seguro dentro de una celda CSV:
 * - Si contiene comas, comillas o saltos de línea, lo envuelve en comillas.
 * - Las comillas internas se duplican según el estándar RFC 4180.
 */
function escaparValor(valor) {
  if (valor === null || valor === undefined) return '';
  const texto = String(valor);
  if (/[",\n\r;]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/**
 * Genera y descarga un CSV.
 * @param {string} nombreArchivo  Nombre del archivo final (con .csv)
 * @param {Array<object>} filas   Datos a exportar
 * @param {Array<{clave:string, etiqueta:string, formato?:Function}>} columnas
 *        Definición de columnas. `formato` es opcional para transformar el valor.
 */
export function exportarCSV(nombreArchivo, filas, columnas) {
  // Cabecera del CSV
  const cabecera = columnas.map((c) => escaparValor(c.etiqueta)).join(';');

  // Cuerpo
  const cuerpo = filas
    .map((fila) =>
      columnas
        .map((c) => {
          const bruto = obtenerValor(fila, c.clave);
          const valor = c.formato ? c.formato(bruto, fila) : bruto;
          return escaparValor(valor);
        })
        .join(';'),
    )
    .join('\n');

  // Construimos el contenido completo. El BOM al principio (\uFEFF)
  // hace que Excel lo abra con codificación UTF-8 correctamente.
  const contenido = '\uFEFF' + cabecera + '\n' + cuerpo;

  // Descargamos como archivo
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

// Permite acceder a propiedades anidadas con notación 'sector.nombre'
function obtenerValor(obj, ruta) {
  return ruta.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
