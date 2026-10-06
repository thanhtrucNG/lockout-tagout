// Small helpers that build bilingual labels ({ en, vi }) for family / size / edition values.
export const L = (en, vi = en) => ({ en, vi });
export const STD = L('Standard', 'Tiêu chuẩn');
export const vnum = value => String(value).replace('.', ',');

export const COLOURS = {
  Red: L('Red', 'Đỏ'), Yellow: L('Yellow', 'Vàng'), Green: L('Green', 'Xanh lá'), Blue: L('Blue', 'Xanh dương'),
  Orange: L('Orange', 'Cam'), Black: L('Black', 'Đen'), White: L('White', 'Trắng'), Brown: L('Brown', 'Nâu'),
  Purple: L('Purple', 'Tím'), Silver: L('Silver', 'Bạc'), Gold: L('Gold', 'Vàng kim'),
  Transparent: L('Transparent', 'Trong suốt'), Combo: L('5-colour set', 'Bộ 5 màu'),
};
export const colourOf = text => {
  const found = Object.keys(COLOURS).find(name => new RegExp(`\\b${name}\\b`, 'i').test(text));
  if (found) return COLOURS[found];
  if (/\bclear\b/i.test(text)) return COLOURS.Transparent;
  return null;
};

export const pack = count => count === 1 ? L('Single', 'Chiếc lẻ') : L(`Pack of ${count}`, `Gói ${count}`);
export const keyed = (kind, count) => {
  const k = kind === 'KD' ? L('Keyed different', 'Khác chìa') : L('Keyed alike', 'Cùng chìa');
  const p = count === 1 ? L('single', 'lẻ 1 chiếc') : L(`pack of ${count}`, `gói ${count}`);
  return L(`${k.en} · ${p.en}`, `${k.vi} · ${p.vi}`);
};
export const range = (low, high, unit = 'in.') => L(`${low}–${high} ${unit}`, `${vnum(low)}–${vnum(high)} ${unit}`);
export const upTo = (high, unit = 'in.') => L(`Up to ${high} ${unit}`, `Đến ${vnum(high)} ${unit}`);
export const size3 = (a, b, c, unit = 'in.') => L(`${a} × ${b} × ${c} ${unit}`, `${vnum(a)} × ${vnum(b)} × ${vnum(c)} ${unit}`);
export const size2 = (a, b, unit = 'in.') => L(`${a} × ${b} ${unit}`, `${vnum(a)} × ${vnum(b)} ${unit}`);
export const one = (en, vi) => L(en, vi);

/** Trailing quantity in a catalogue description ("... 6", "... 6 cards", "... 250/roll"). */
export function tailQuantity(text) {
  const roll = text.match(/(\d+)\/roll\s*$/i); if (roll) return Number(roll[1]);
  const match = text.match(/(?:^|\s)(\d+)(?:\s+cards)?\s*$/i);
  return match ? Number(match[1]) : 1;
}
