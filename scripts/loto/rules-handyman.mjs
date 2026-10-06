// Maps Handyman's own products (Odoo exports and the price-list PDF) to the same product tuple used for Brady-range items.
// Producer names (Sofamel, Allegro, Space Age) never reach the site; their model codes survive only as plain variant labels.
import { L, STD, COLOURS, pack, keyed, range, size2, vnum } from './labels.mjs';

const ONE = pack(1);
const item = (concept, fam, dim = STD, ed = ONE, qty = 1) => ({ concept, fam, dim, ed, qty });
const F = (en, vi) => L(en, vi);

const GATE = { 'GS GVL-04': [2.5, 5], 'GS GVL-06': [5, 6.5], 'GS GVL-08': [6.5, 10], 'GS GVL-10': [10, 13] };
const HM_BREAKER = {
  'GS CBL-SP-01': ['Single pole 01', 'Một cực 01'], 'GS CBL-SP-02': ['Single pole 02', 'Một cực 02'], 'GS CBL-MP-01': ['Multi-pole 01', 'Nhiều cực 01'],
  'GS CBL-MFU': ['Multi-functional universal', 'Đa năng nhiều chức năng'], 'GS CBL-Y-TS': ['Twist screw, yellow', 'Vặn vít, vàng'], 'GS CBL-TS2': ['Twist screw 02', 'Vặn vít 02'],
  'GS CBLU-Y-TS': ['Universal twist screw, yellow', 'Đa năng vặn vít, vàng'], 'GS CBLU-Y': ['Universal, yellow', 'Đa năng, vàng'], 'GS CBLU-B': ['Universal, blue', 'Đa năng, xanh dương'],
  'GS CBLU-G': ['Universal, green', 'Đa năng, xanh lá'], 'GS CBLU-UR': ['Universal, golden', 'Đa năng, vàng kim'], 'GS CBLU-BIG': ['Big', 'Lớn'],
};
const PANEL = {
  'GS EPL - 45': ['Round 45', 'Tròn 45'], 'GS EPL - 55': ['Round 55', 'Tròn 55'], 'GS EPL - SS': ['Square, small', 'Vuông nhỏ'], 'GS EPL - SB': ['Square, big', 'Vuông lớn'],
  'GS EPL - SB 45': ['Square, big, 45°', 'Vuông lớn, 45°'], 'GS EPL - SB 90': ['Square, big, 90°', 'Vuông lớn, 90°'], 'GS EPL - ES': ['Ellipse', 'Elip'], 'GS EPL-HL-1': ['Handle lockout 01', 'Khóa tay gạt 01'],
};
const CABLE_MODELS = {
  'GS MCL-01': ['Model 01', 'Mẫu 01', STD], 'GS MCL-01H': ['Model 01 with handle', 'Mẫu 01 có tay cầm', STD],
  'GS MCL-01-2M': ['Model 01', 'Mẫu 01', F('2 m insulated steel cable', 'Cáp thép bọc cách điện 2 m')], 'GS MCL-01H-2M': ['Model 01 with handle', 'Mẫu 01 có tay cầm', F('2 m insulated steel cable', 'Cáp thép bọc cách điện 2 m')],
  'GS MCL-01P-2M': ['Model 01 Prime', 'Mẫu 01 Prime', F('2 m insulated steel cable', 'Cáp thép bọc cách điện 2 m')],
  'GS MCL-02D': ['Model 02, dielectric', 'Mẫu 02, cách điện', STD], 'GS MCL-02M': ['Model 02, metallic cable', 'Mẫu 02, cáp kim loại', STD], 'GS MCL-03': ['Model 03', 'Mẫu 03', STD],
  'GS MCL-04-2M': ['Model 04', 'Mẫu 04', F('2 m insulated steel cable', 'Cáp thép bọc cách điện 2 m')], 'GS MCL-05-2M': ['Model 05', 'Mẫu 05', F('2 m insulated steel cable', 'Cáp thép bọc cách điện 2 m')],
  'GS EMCL-M55': ['Economy', 'Tiết kiệm', STD], 'GS MCL-M55': ['Metallic', 'Kim loại', STD], 'GS MCL-M55-2M': ['Metallic', 'Kim loại', F('2 m insulated steel cable', 'Cáp thép bọc cách điện 2 m')],
};
const STATIONS = {
  'GS LS-6210': ['6', 'GS LS-6210'], 'GS LS-6220': ['6', 'GS LS-6220'], 'GS LS-12210': ['12'], 'GS LS-24850': ['24', 'GS LS-24850'], 'GS LS-24120': ['24', 'GS LS-24120'], 'GS LS-36230': ['36'],
};

/** Tuple for one unique Odoo ref, or null if the ref has no rule. */
export function odooItem(ref) {
  if (ref === 'Brandy.153452') return item('pad-nylon-steel', COLOURS.Red, STD, keyed('KD', 1));
  if (ref.startsWith('GS SLPC-')) { const n = ref.match(/(\d)F/)[1]; return item('pad-cable', STD, F(`${n} ft cable`, `Cáp ${n} ft`)); }
  if (ref.startsWith('GS PJ')) {
    const long = ref.includes('PJLS'), prime = / P /.test(` ${ref.replace('GS ', '')} `) || ref.includes('-P ');
    const ka = /KA/.test(ref);
    return item('pad-jacket', long ? F('Long shackle', 'Còng dài') : F('Regular shackle', 'Còng thường'), prime ? F('Prime', 'Prime') : STD, keyed(ka ? 'KA' : 'KD', 1));
  }
  if (STATIONS[ref]) { const [n, model] = STATIONS[ref]; return item('kit-station-padlock', F('Wall padlock station', 'Bảng treo khóa gắn tường'), F(`${n} locks`, `${n} khóa`), model ? F(`Model ${model.replace('GS ', '')}`, `Mẫu ${model.replace('GS ', '')}`) : ONE); }
  if (/^GS PS-\d+/.test(ref)) { const n = ref.match(/PS-(\d+)/)[1]; return item('kit-station-padlock', F('Mini padlock station', 'Bảng treo khóa mini'), F(`${n} locks`, `${n} khóa`)); }
  if (ref === 'GS-LTS 6' || ref === 'GS-LTS 9' || ref === 'GS-LTS 10') { const n = ref.split(' ')[1]; return item('kit-station-lockout', F('Lockout tagout station', 'Trạm lockout tagout'), F(`${n} locks`, `${n} khóa`)); }
  if (ref === 'GS-LTS 6C' || ref === 'GS-LTS-9C' || ref === 'GS-LTS 10C') { const n = ref.match(/(\d+)C/)[1]; return item('kit-station-lockout', F('Lockout tagout station, clear fascia', 'Trạm lockout tagout, mặt trong suốt'), F(`${n} locks`, `${n} khóa`)); }
  if (ref === 'GS-LTS 6+GLB') return item('kit-station-lockout', F('Lockout tagout station with group lock box', 'Trạm lockout tagout kèm hộp khóa nhóm'), F('6 locks', '6 khóa'));
  if (ref === 'SOFAMEL.765100') return item('kit-station-lockout', F('Lockout station, model LS-4', 'Trạm lockout, mẫu LS-4'), F('4 locks', '4 khóa'));
  if (ref === 'SOFAMEL.765101') return item('kit-station-lockout', F('Lockout station, model LS-10', 'Trạm lockout, mẫu LS-10'), F('10 locks', '10 khóa'));
  if (ref === '4400‐L') return item('kit-station-lockout', F('Lockout tagout wall case', 'Hộp treo tường lockout tagout'), F('Model 4400-L', 'Mẫu 4400-L'));
  if (ref === 'GS SLC-5K') return item('kit-storage-cabinet', F('Safety lockout cabinet with 5 keys', 'Tủ lockout kèm 5 chìa'));
  if (ref === 'GS SLC-5L') return item('kit-storage-cabinet', F('Safety lockout cabinet with 5 locks', 'Tủ lockout kèm 5 khóa'));
  if (ref === 'GS H-T-C') return item('kit-storage-cabinet', F('Hasp & tag cabinet', 'Tủ đựng móc khóa & thẻ'), F('50 hasps + 50 tags', '50 móc + 50 thẻ'));
  if (ref.startsWith('GS GLK-')) { const n = { 1: 4, 2: 8, 3: 24 }[ref.at(-1)]; return item('grp-box-key', STD, F(`${n} keys`, `${n} chìa`)); }
  if (ref === 'GS GLB 13SS') return item('grp-box-lock', F('Stainless steel', 'Inox'), F('13 locks', '13 khóa'));
  if (ref === 'GS GLB 17-CS') return item('grp-box-lock', F('With combined storage', 'Kèm ngăn chứa'), F('17 locks', '17 khóa'));
  if (ref === 'GS GLB-S26') return item('grp-box-lock', F('Slider', 'Cửa trượt'), F('26 locks', '26 khóa'));
  if (/^GS EHASP - 0\d$/.test(ref)) { const n = ref.slice(-2); return item('grp-hasp', F(`De-electric flexible ${n}`, `Dẻo cách điện ${n}`), STD, ONE); }
  if (ref === 'GS D-HASP-S3') return item('grp-hasp', F('Di-electric slider', 'Cách điện trượt'), F('3 locks', '3 khóa'));
  if (ref === 'GS D-HASP-S6') return item('grp-hasp', F('Di-electric slider', 'Cách điện trượt'), F('6 locks', '6 khóa'));
  const hasp = { 'SOFAMEL.764101': 'EA-7818', 'SOFAMEL.764102': 'EAL-3628', 'SOFAMEL.63103': 'EN-6/25', 'SOFAMEL.764100': 'EN-6/38', 'SOFAMEL.763104': 'EV-318', 'SOFAMEL.764103': 'EV-52' }[ref];
  if (hasp) return item('grp-hasp', F(`Industrial hasp, model ${hasp}`, `Móc khóa công nghiệp, mẫu ${hasp}`));
  if (ref === 'GS LH-T-A27') return item('tag-hasp', F('Hasp tag A27', 'Thẻ treo móc A27'));
  if (ref === 'GS S-TAG') return item('tag-handyman', STD, F('0.5 mm thick', 'Dày 0,5 mm'), pack(10), 10);
  if (ref === 'GS S-TAG-7') return item('tag-handyman', STD, F('0.7 mm thick', 'Dày 0,7 mm'), pack(10), 10);
  if (ref === 'GS C-TAGS') return item('tag-custom', F('Choose template from the catalogue', 'Chọn mẫu từ catalogue'));
  if (ref === 'GS GVLC') return item('vlv-cylinder', STD);
  if (GATE[ref]) return item('vlv-gate', STD, range(...GATE[ref]));
  if (ref === 'GS BVL-01') return item('vlv-ball', F('Standard', 'Tiêu chuẩn'), F('Small', 'Nhỏ'));
  if (ref === 'GS BVL-01S') return item('vlv-ball', F('Standard', 'Tiêu chuẩn'), F('Small 01', 'Nhỏ 01'));
  if (ref === 'GS BVL-L') return item('vlv-ball', F('Standard', 'Tiêu chuẩn'), F('Large', 'Lớn'));
  if (ref === 'GS VL-ARM-S') return item('vlv-ball-arm', STD, F('Small', 'Nhỏ')); if (ref === 'GS VL-ARM-L') return item('vlv-ball-arm', STD, F('Large', 'Lớn'));
  if (ref === 'GS BFVL') return item('vlv-butterfly', STD); if (ref === 'GS BFVL-U') return item('vlv-butterfly', F('Universal', 'Vạn năng'));
  if (ref === 'CBL-01-2M+BFVL-U') return item('vlv-combo', F('Cable 01 (2 m) + universal butterfly lockout', 'Khóa cáp 01 (2 m) + khóa van bướm vạn năng'));
  if (CABLE_MODELS[ref]) { const [en, vi, dim] = CABLE_MODELS[ref]; return item('cab-handyman', F(en, vi), dim); }
  if (ref === 'GS CBL-EU-R') return item('ele-mcb', F('Europa, red', 'Europa, đỏ')); if (ref === 'GS CBL-EU-Y') return item('ele-mcb', F('Europa, yellow', 'Europa, vàng')); if (ref === 'GS CBL-ABB') return item('ele-mcb', F('For ABB MCB', 'Cho MCB ABB'));
  if (HM_BREAKER[ref]) { const [en, vi] = HM_BREAKER[ref]; return item('ele-breaker-hm', F(en, vi)); }
  if (ref === 'GS CBLS COMBO 3') return item('ele-breaker-set', F('Set of 3', 'Bộ 3'), STD, ONE, 3);
  if (ref === 'GS CBLS COMBO 4') return item('ele-breaker-set', F('Set of 4', 'Bộ 4'), STD, ONE, 4);
  if (ref === 'GS CBLU-COMBO') return item('ele-breaker-set', F('Set of 5 (yellow, green, blue, golden, big)', 'Bộ 5 (vàng, xanh lá, xanh dương, vàng kim, lớn)'), STD, ONE, 5);
  if (ref === 'GS CBL-WS-01') return item('sga-wall-switch', STD);
  if (PANEL[ref]) { const [en, vi] = PANEL[ref]; return item('ele-panel', F(en, vi)); }
  if (ref === 'GS EPL-PCL') return item('plg-powercord', F('Computer power cord lockout', 'Khóa dây nguồn máy tính'));
  if (/^GS CLO-1/.test(ref)) { const t = ref.at(-1); return item('sga-cylinder', t === 'Y' ? F('Yellow', 'Vàng') : F(`Type ${t}`, `Loại ${t}`)); }
  if (ref === 'ELOCK-FA') return item('ele-fire', F('Fire alarm circuit lockout kit', 'Bộ khóa mạch báo cháy'));
  return null;
}

/** Price-list PDF models. `dup` names the Odoo ref that already covers the same product (the Odoo item wins). */
export function pdfItem(model, description) {
  const D = description;
  const T = {
    'VH-25': () => item('grp-hasp', F('Vinyl-coated, small', 'Bọc vinyl, loại nhỏ')), 'VH-39': () => item('grp-hasp', F('Vinyl-coated, premier', 'Bọc vinyl, loại cao cấp')),
    'VH-N33': () => item('grp-hasp', F('Nylon, 3 mm shackle', 'Nylon, còng 3 mm')), 'VH-N36': () => item('grp-hasp', F('Nylon, 6 mm shackle', 'Nylon, còng 6 mm')),
    'VH-E25': () => item('grp-hasp', F('Electroplated, 25', 'Mạ điện, 25')), 'VH-E39': () => item('grp-hasp', F('Electroplated, 39', 'Mạ điện, 39')),
    'VH-SSH': () => item('grp-hasp', F('Stainless steel', 'Inox')), 'VH-AL10': () => item('grp-hasp-labeled', F('Aluminium', 'Nhôm'), F('Labelling hasp', 'Móc có nhãn ghi')),
    'TAG-T01': () => item('tag-handyman', STD, F('0.5 mm thick', 'Dày 0,5 mm'), pack(10), 10), 'TAG-T02': () => item('tag-handyman', STD, F('0.7 mm thick', 'Dày 0,7 mm'), pack(10), 10),
    'LSP-KD+M': () => item('pad-jacket', F('Premier, red, master key (1 per 5 locks)', 'Premier, đỏ, chìa chủ (1 cho mỗi 5 khóa)'), STD, keyed('KD', 1)),
    'V-PLSP-KD': () => item('pad-jacket', F('Premier, red', 'Premier, đỏ'), STD, keyed('KD', 1)),
    'V-NPL-KD': () => item('pad-nylon-nylon', COLOURS.Red, STD, keyed('KD', 1)),
    'V-PRS-3A': () => item('pad-jacket', F('Regular, same key', 'Thường, cùng chìa'), STD, keyed('KA', 3), 3),
    'V-02-GVL': () => item('vlv-gate', STD, range(1, 2.5)), 'V-04-GVL': () => item('vlv-gate', STD, range(2.5, 5)), 'V-06-GVL': () => item('vlv-gate', STD, range(5, 6.5)),
    'V-08-GVL': () => item('vlv-gate', STD, range(6.5, 10)), 'V-10-GVL': () => item('vlv-gate', STD, range(10, 13)), 'V-AGV': () => item('vlv-gate-adj', STD, range(1, 6.5)),
    'V-BV 01': () => item('vlv-ball', F('Standard', 'Tiêu chuẩn'), F('Small', 'Nhỏ')), 'V-BV 02': () => item('vlv-ball', F('Standard', 'Tiêu chuẩn'), F('Medium, 1.5–2.5 in.', 'Vừa, 1,5–2,5 in.')),
    'V-BV 03': () => item('vlv-ball', F('Standard', 'Tiêu chuẩn'), F('Large', 'Lớn')),
    'V-UVL': () => item('vlv-universal', F('Handyman universal', 'Vạn năng Handyman')),
    'V-UML': () => item('cab-handyman', F('Universal multi cable', 'Cáp đa năng nhiều móc'), STD), 'V-CL6': () => item('cab-handyman', F('Multipurpose, 6 ft', 'Đa dụng, 6 ft'), STD),
    'V-BFV': () => item('vlv-butterfly', STD),
    'V-CLO-E': () => item('plg-electrical', F('Electrical plug lockout', 'Khóa phích cắm điện')),
    'V-SPLO': () => item('plg-elec-pneu', STD, F('Small', 'Nhỏ')), 'V-LPLO': () => item('plg-elec-pneu', STD, F('Big', 'Lớn')),
    'V-UBL-SN': () => item('ele-breaker-hm', F('Universal, adjustable nut', 'Đa năng, đai ốc chỉnh')),
    'CBL SET': () => item('ele-breaker-set', F('3 different sizes', '3 cỡ khác nhau'), STD, ONE, 3),
    'PIN IN CBL': () => item('ele-mcb', F('Pin-in standard', 'Chốt vào tiêu chuẩn'), STD, pack(3), 3), 'PIN OUT CBL': () => item('ele-mcb', F('Pin-out standard', 'Chốt ra tiêu chuẩn'), STD, pack(3), 3),
    'V-LB12': () => item('ele-oversized', F('Large (V-LB12)', 'Cỡ lớn (V-LB12)')), 'V-CBF-COMBO': () => item('ele-breaker-set', F('Miniature combo', 'Combo MCB'), STD, ONE, 5),
    'CS-CBF': () => item('ele-mcb', F('Single size', 'Một cỡ')),
    'V-CIR-45': () => item('ele-panel', F('Round 45', 'Tròn 45')), 'V-CIR-55': () => item('ele-panel', F('Round 55', 'Tròn 55')),
    'V-CIR-22': () => item('sga-pb-cover', F('Push button switch lockout', 'Khóa nút nhấn'), F('22 mm', '22 mm')),
    'V-WSL': () => item('sga-wall-switch', STD), 'V-SQS': () => item('ele-panel', F('Square, small', 'Vuông nhỏ')), 'V-SQB': () => item('ele-panel', F('Square, big', 'Vuông lớn')),
    'V-MPB': () => item('sga-pb-cover', F('Mushroom push button lockout', 'Khóa nút nhấn nấm')),
    'V-RS14 - M': () => item('plg-pinsleeve', F('Socket lockout, 415 V, red', 'Khóa ổ cắm, 415 V, đỏ')), 'V-RS14 - B': () => item('plg-pinsleeve', F('Socket lockout, 500 V, red', 'Khóa ổ cắm, 500 V, đỏ')),
    'V-RP15': () => item('plg-pinsleeve', F('Plug lockout, yellow', 'Khóa phích cắm, vàng')),
    'V-HPL': () => item('sga-pendant', F('Hoist controller lockout', 'Khóa tay điều khiển cầu trục')),
    'V-PS6': () => item('kit-station-padlock', F('Mini padlock station', 'Bảng treo khóa mini'), F('6 locks', '6 khóa')), 'V-PS12': () => item('kit-station-padlock', F('Mini padlock station', 'Bảng treo khóa mini'), F('12 locks', '12 khóa')),
    'V-GB13': () => item('grp-box-portable', F('Metal group lockout box', 'Hộp khóa nhóm kim loại')),
    'V-LSP-B': () => item('kit-station-lockout', F('PVC lockout station', 'Trạm lockout nhựa PVC')),
    'V-LSS16': () => item('kit-storage-cabinet', F('Metal lockout cabinet', 'Tủ lockout bằng kim loại'), size3(16, 14, 6)),
    'PVC-V-LS10': () => item('kit-station-lockout', F('PVC lockout station with hinged cover', 'Trạm lockout PVC có nắp bản lề'), F('5–10 locks', '5–10 khóa')),
    'PVC-V-LS20': () => item('kit-station-lockout', F('PVC lockout station with hinged cover', 'Trạm lockout PVC có nắp bản lề'), F('10–20 locks', '10–20 khóa')),
    'V-VLK': () => item('kit-loto', F('Valve lockout kit', 'Bộ khóa van')), 'V-ELK': () => item('kit-loto', F('Electrical lockout kit', 'Bộ khóa thiết bị điện')),
    'V-P2-R': () => item('kit-loto', F('Personal electrical lockout pouch', 'Túi lockout điện cá nhân')),
  };
  return T[model]?.() ?? null;
}
function size3(a, b, c) { return L(`${a} × ${b} × ${c} in.`, `${vnum(a)} × ${vnum(b)} × ${vnum(c)} in.`); }

/** PDF model → Odoo ref that is the same product (Odoo wins: current system, VND price). */
export const PDF_DUPLICATES = {
  'TAG-T01': 'GS S-TAG', 'TAG-T02': 'GS S-TAG-7', 'V-04-GVL': 'GS GVL-04', 'V-06-GVL': 'GS GVL-06', 'V-08-GVL': 'GS GVL-08', 'V-10-GVL': 'GS GVL-10',
  'V-BFV': 'GS BFVL', 'V-WSL': 'GS CBL-WS-01', 'V-CIR-45': 'GS EPL - 45', 'V-CIR-55': 'GS EPL - 55', 'V-SQS': 'GS EPL - SS', 'V-SQB': 'GS EPL - SB',
  'V-PS6': 'GS PS-6', 'V-PS12': 'GS PS-12', 'V-BV 01': 'GS BVL-01', 'V-BV 03': 'GS BVL-L',
};
/** Brady-range SKUs that are the same product as a Handyman one (the Handyman item wins). */
export const BRADY_DUPLICATES = {
  65560: 'GS GVL gate valve 1–2.5 in. (V-02-GVL)', 65561: 'GS GVL-04', 65562: 'GS GVL-06', 65563: 'GS GVL-08', 65564: 'GS GVL-10',
  153671: 'V-VLK valve lockout kit', 153670: 'V-ELK electrical lockout kit', 153669: 'V-P2-R personal electrical pouch',
  LC252M: 'V-LSS16 metal cabinet 16×14×6 in.', 50989: 'GS PS-6 / V-PS6', 50990: 'GS PS-12 / V-PS12', 49303: 'GS BFVL', 65392: 'GS CBL-WS-01',
  'SDPL-RED-38ST-KD': 'GS PJRS-KD / Odoo Brady-listed red padlock', 'SDPL-RED-38PL-KD': 'V-NPL-KD', 149514: 'CS-CBF',
};
