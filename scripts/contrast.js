/* Calculadora de contraste WCAG. No se decide ningún color a ojo:
   se corre este script y se lee el número. */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function srgbToLin(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map(srgbToLin);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrast(hex1, hex2) {
  const L1 = luminance(hexToRgb(hex1));
  const L2 = luminance(hexToRgb(hex2));
  const [a, b] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (b + 0.05);
}
/* mezcla lineal simple en sRGB (suficiente para elegir un tono apagado) */
function mix(hex1, hex2, t) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

const PAPEL = '#E7E5DF';
const GRAFITO = '#2B2E33';
const PETROLEO = '#3E6E6B';
const BLANCO = '#FFFFFF';

console.log('--- combinaciones base ---');
console.log('grafito / papel   ', contrast(GRAFITO, PAPEL).toFixed(2));
console.log('petroleo / papel  ', contrast(PETROLEO, PAPEL).toFixed(2));
console.log('blanco / petroleo ', contrast(BLANCO, PETROLEO).toFixed(2));
console.log('blanco / grafito  ', contrast(BLANCO, GRAFITO).toFixed(2));
console.log('papel / grafito   ', contrast(PAPEL, GRAFITO).toFixed(2));
console.log('petroleo / grafito', contrast(PETROLEO, GRAFITO).toFixed(2));

console.log('\n--- apagado sobre papel (busca >=4.5) ---');
for (let t = 0; t <= 0.6; t += 0.05) {
  const c = mix(GRAFITO, PAPEL, t);
  console.log('t=' + t.toFixed(2), c, contrast(c, PAPEL).toFixed(2));
}

console.log('\n--- apagado sobre grafito (busca >=4.5) ---');
for (let t = 0; t <= 0.6; t += 0.05) {
  const c = mix(PAPEL, GRAFITO, t);
  console.log('t=' + t.toFixed(2), c, contrast(c, GRAFITO).toFixed(2));
}

console.log('\n--- petroleo como texto sobre papel: cuanto hay que oscurecerlo ---');
for (let t = 0; t <= 0.5; t += 0.05) {
  const c = mix(PETROLEO, '#000000', t);
  console.log('t=' + t.toFixed(2), c, contrast(c, PAPEL).toFixed(2));
}

/* --- control de paleta (demostración, ver README "El control de paleta") -
   Dourado & Fernández es ahora el valor por defecto en :root (bare, sin
   clase); "Original" es el petróleo nativo de arriba, movido a la clase
   .paleta-original. No se asume que el ratio de Dourado se herede por ser
   un rojo parecido: se recalcula aquí con sus hexadecimales reales. */
console.log('\n--- control de paleta: blanco/relleno (target >=5.76) y oscura/papel (target >=6.74) ---');
console.log('Teja (Dourado & Fernández, por defecto)  blanco/#9C2A2E =', contrast(BLANCO, '#9C2A2E').toFixed(2),
  '  #7A1418/papel =', contrast('#7A1418', PAPEL).toFixed(2));
console.log('Original (petróleo nativo)               blanco/#3E6E6B =', contrast(BLANCO, '#3E6E6B').toFixed(2),
  '  #2F5350/papel =', contrast('#2F5350', PAPEL).toFixed(2));
console.log('Añil                                      blanco/#2C4A76 =', contrast(BLANCO, '#2C4A76').toFixed(2),
  '  #1F3554/papel =', contrast('#1F3554', PAPEL).toFixed(2));
console.log('Siena                                     blanco/#8A4A28 =', contrast(BLANCO, '#8A4A28').toFixed(2),
  '  #6B3A1F/papel =', contrast('#6B3A1F', PAPEL).toFixed(2));

/* --- papel blanco de Dourado en Teja (bare :root), ver README "El control
   de paleta" y nota junto a --papel en style.css. Original/Añil/Siena
   siguen sobre PAPEL (gris nativo, #E7E5DF) calculado arriba; esto recalcula
   los mismos tokens de texto contra el blanco real de Dourado, sin asumir
   que el ratio mejora solo por ser más claro. */
const PAPEL_TEJA = '#FFFFFF';
const PAPEL_PANEL_TEJA = '#F2F0EA';
const TEXTO_APAGADO = '#636567';
const PETROLEO_OSCURO_TEJA = '#7A1418';
console.log('\n--- Teja: papel blanco de Dourado (#FFFFFF) y panel (#F2F0EA) ---');
console.log('texto (grafito) / papel blanco      ', contrast(GRAFITO, PAPEL_TEJA).toFixed(2));
console.log('texto (grafito) / papel-panel        ', contrast(GRAFITO, PAPEL_PANEL_TEJA).toFixed(2));
console.log('texto-apagado / papel blanco         ', contrast(TEXTO_APAGADO, PAPEL_TEJA).toFixed(2));
console.log('texto-apagado / papel-panel          ', contrast(TEXTO_APAGADO, PAPEL_PANEL_TEJA).toFixed(2));
console.log('texto-acento (petroleo-oscuro) / papel blanco', contrast(PETROLEO_OSCURO_TEJA, PAPEL_TEJA).toFixed(2));
console.log('texto-sobre-grafito (=papel=blanco) / grafito', contrast(PAPEL_TEJA, GRAFITO).toFixed(2));
console.log('papel blanco / papel-panel (¿se distinguen?) ', contrast(PAPEL_TEJA, PAPEL_PANEL_TEJA).toFixed(2));
