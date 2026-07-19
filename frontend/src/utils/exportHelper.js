export function downloadCSV(headers, rows, filename) {
  const content = [
    headers.join(','),
    ...rows.map(row => row.map(val => {
      const stringVal = val === null || val === undefined ? '' : String(val);
      if (/[",\n\r]/.test(stringVal)) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
