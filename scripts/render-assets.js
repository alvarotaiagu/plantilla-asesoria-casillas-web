/* Genera og-image.png (1200x630) e iconos PNG del manifest a partir de
   plantillas HTML locales, con Playwright. Sin generador de imágenes: esto
   es render real de HTML/CSS/SVG propio, no una imagen inventada. */
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const b = await chromium.launch();

  const p1 = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p1.goto('file://' + path.join(__dirname, 'og-template.html'));
  await p1.waitForTimeout(150);
  await p1.screenshot({ path: path.join(__dirname, '..', 'assets', 'img', 'og-image.png') });
  await p1.close();

  const p2 = await b.newPage({ viewport: { width: 512, height: 512 } });
  await p2.goto('file://' + path.join(__dirname, 'icon-template.html'));
  await p2.waitForTimeout(80);
  await p2.screenshot({ path: path.join(__dirname, '..', 'assets', 'img', 'icon-512.png') });
  await p2.close();

  const p3 = await b.newPage({ viewport: { width: 192, height: 192 } });
  await p3.goto('file://' + path.join(__dirname, 'icon-template.html'));
  await p3.evaluate(() => {
    document.body.style.width = '192px';
    document.body.style.height = '192px';
    document.querySelector('svg').style.width = '192px';
    document.querySelector('svg').style.height = '192px';
  });
  await p3.waitForTimeout(80);
  await p3.screenshot({ path: path.join(__dirname, '..', 'assets', 'img', 'icon-192.png') });
  await p3.close();

  await b.close();
  console.log('assets generados: og-image.png, icon-512.png, icon-192.png');
})();
