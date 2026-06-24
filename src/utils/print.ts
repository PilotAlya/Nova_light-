export function printElement(element: HTMLElement, title: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  const styles = Array.from(document.styleSheets)
    .map(s => {
      try { return Array.from(s.cssRules || []).map(r => r.cssText).join(''); }
      catch { return ''; }
    }).join('');

  win.document.write(`
    <html><head><title>${title}</title>
    <style>${styles} body { padding: 20px; } @media print { @page { margin: 10mm; } }</style>
    </head><body>${element.outerHTML}</body></html>
  `);
  win.document.close();
  setTimeout(() => { win.print(); }, 300);
}
