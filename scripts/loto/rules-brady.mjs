// Maps each row of the Brady catalogue extract to a neutral Handyman product tuple:
//   { concept, fam, dim, ed, qty }   fam = design / colour, dim = size or spec, ed = pack or keying.
// Brady names are never carried over: labels are rebuilt from the technical facts only.
import { L, STD, COLOURS, colourOf, pack, keyed, range, upTo, size2, size3, vnum, tailQuantity } from './labels.mjs';

const ONE = pack(1);
const item = (concept, fam, dim = STD, ed = ONE, qty = 1) => ({ concept, fam, dim, ed, qty });
const SKIP = reason => ({ skip: reason });

// ---------- padlocks ----------
const BODY = { SDPL: 'pad-nylon', SDAL: 'pad-alu', CPPL: 'pad-compact-nylon', CPAL: 'pad-compact-alu' };
const COLOUR_CODE = { RED: 'Red', GRN: 'Green', ORG: 'Orange', BLU: 'Blue', YLW: 'Yellow', BLK: 'Black', WHT: 'White', BRN: 'Brown', PRP: 'Purple' };
function padlock(sku) {
  const [body, colour, shackle, key] = sku.split('-');
  if (/#/.test(key)) return SKIP('Custom key-code set: made to order, not a stock item');
  let concept = BODY[body];
  if (body === 'SDPL') concept = shackle === '38PL' ? 'pad-nylon-nylon' : 'pad-nylon-steel';
  const shackles = {
    '38ST': STD, '38PL': STD,
    '76ST': L('76 mm steel shackle', 'Còng thép 76 mm'),
    '25AL': L('25 mm aluminium shackle', 'Còng nhôm 25 mm'),
    '200CB': L('200 mm cable shackle', 'Còng cáp 200 mm'),
    '400CB': L('400 mm cable shackle', 'Còng cáp 400 mm'),
  };
  let dim = shackles[shackle] ?? STD;
  if (body === 'SDAL' && shackle === '38ST') dim = L('38 mm steel shackle', 'Còng thép 38 mm');
  if (body === 'CPAL' || (body === 'CPPL' && false)) dim = STD;
  const kind = key.slice(0, 2), count = key.length > 2 ? Number(key.slice(2)) : 1;
  return item(concept, COLOURS[COLOUR_CODE[colour]], dim, keyed(kind, count), count);
}

const LANG = {
  English: L('English', 'Tiếng Anh'), Spanish: L('Spanish', 'Tiếng Tây Ban Nha'), French: L('French', 'Tiếng Pháp'),
  Multi: L('English / French / Spanish', 'Anh / Pháp / Tây Ban Nha'),
};

function label(row) {
  const { sku, desc } = row;
  const qty = tailQuantity(desc);
  const sz = desc.match(/([\d.]+) in\. x ([\d.]+) in\./);
  const dim = sz ? size2(sz[1], sz[2]) : STD;
  if (/overlaminate/i.test(desc)) return item('pad-labels', L('Overlaminate strips', 'Màng bảo vệ nhãn'), dim, pack(qty), qty);
  if (/English, French, Spanish/.test(desc)) return item('pad-labels', LANG.Multi, L(`${/Compact/.test(desc) ? 'Compact' : 'Standard'}, ${dim.en}`, `${/Compact/.test(desc) ? 'Nhỏ' : 'Tiêu chuẩn'}, ${dim.vi}`), L(`${qty} cards`, `${qty} thẻ`), qty);
  const language = desc.match(/English|Spanish|French/)?.[0];
  if (sku === '51379') return item('pad-labels', LANG.Multi, STD, L('6 of each language', '6 nhãn mỗi ngôn ngữ'), 18);
  if (language) return item('pad-labels', LANG[language], dim, pack(qty), qty);
  return item('pad-labels', L('Blank, write-on', 'Trơn, viết tay'), dim, pack(qty), qty);
}

// ---------- group lockout ----------
const hasp = {
  105718: ['Style 1', 'Kiểu 1', 1, 1], 105719: ['Style 1', 'Kiểu 1', 1.5, 1],
  871239: ['Heavy-duty stainless', 'Inox chịu lực', null, 24],
  133161: ['Style 2', 'Kiểu 2', 1, 1], 65375: ['Style 2', 'Kiểu 2', 1, 12], 133162: ['Style 2', 'Kiểu 2', 1.5, 1], 65376: ['Style 2', 'Kiểu 2', 1.5, 12],
  T218: ['Style 3', 'Kiểu 3', 1, 1], T220: ['Style 3', 'Kiểu 3', 1.5, 1],
  105720: ['Style 4', 'Kiểu 4', 1, 1], 105721: ['Style 4', 'Kiểu 4', 1.5, 1],
  236919: ['Dual jaw', 'Hai hàm', null, 1], 99668: ['Nylon', 'Nylon', null, 1], 'LH220A-RD': ['Red lockout hasp', 'Móc khóa màu đỏ', null, 1],
  87693: ['Stop-sign style', 'Kiểu biển dừng', null, 5],
};
function groupHasp(sku) {
  const [en, vi, jaw, qty] = hasp[sku];
  return item('grp-hasp', L(en, vi), jaw ? L(`${jaw} in. jaws`, `Hàm ${vnum(jaw)} in.`) : STD, pack(qty), qty);
}
const STYLE_BY_SKU = { 65960: 1, 65961: 1, 65962: 1, 65963: 1, 65964: 1, 65967: 1, 65970: 2, 65971: 2, 65972: 2, 65973: 2, 65974: 2, 65975: 2, 39480: 3, 39481: 4 };

// ---------- kits, stations, storage ----------
const KIT = {
  153672: ['Electrical & valve kit, duffel bag, nylon padlocks', 'Bộ điện & van, túi vải, khóa nylon'],
  153671: ['Valve kit, toolbox, aluminium padlocks', 'Bộ van, hộp đồ nghề, khóa nhôm'],
  153673: ['Padlock & tag kit', 'Bộ khóa & thẻ'],
  153669: ['Breaker lockout pouch kit', 'Bộ khóa aptomat trong túi'],
  153670: ['Electrical kit, toolbox, nylon padlocks', 'Bộ thiết bị điện, hộp đồ nghề, khóa nylon'],
  153676: ['Forklift battery connector lockout kit', 'Bộ khóa đầu nối ắc quy xe nâng'],
  153668: ['Lockout tagout pouch kit', 'Bộ lockout tagout trong túi'],
};
const FILLED = {
  153679: ['6-lock board', 'Bảng 6 khóa', 'KD'], 153680: ['6-lock board', 'Bảng 6 khóa', 'KA'],
  153687: ['24-lock board', 'Bảng 24 khóa', 'KD'], 153688: ['24-lock board', 'Bảng 24 khóa', 'KA'],
  153681: ['6-lock cabinet station', 'Trạm tủ 6 khóa', 'KD'], 153682: ['6-lock cabinet station', 'Trạm tủ 6 khóa', 'KA'],
  153683: ['12-lock cabinet station', 'Trạm tủ 12 khóa', 'KD'], 153684: ['12-lock cabinet station', 'Trạm tủ 12 khóa', 'KA'],
  153685: ['Electrical lockout cabinet station', 'Trạm tủ lockout thiết bị điện', 'KD'], 153686: ['Electrical lockout cabinet station', 'Trạm tủ lockout thiết bị điện', 'KA'],
};
const kd = kind => kind === 'KD' ? L('Keyed different', 'Khác chìa') : L('Keyed alike', 'Cùng chìa');
const bag = (concept, en, vi, dim = STD) => item(concept, L(en, vi), dim);
const STORAGE = {
  51173: () => bag('kit-storage-bag', 'Satchel', 'Túi đeo vai'),
  99162: () => bag('kit-storage-bag', 'Duffel bag', 'Túi du lịch'),
  51172: () => bag('kit-storage-bag', 'Pouch', 'Bao đựng', COLOURS.Red),
  87943: () => bag('kit-storage-bag', 'Pouch', 'Bao đựng', COLOURS.Black),
  50979: () => bag('kit-storage-bag', 'Large pouch with zipper', 'Bao lớn có khóa kéo'),
  65780: () => bag('kit-storage-bag', 'Security bag (lockable)', 'Túi an ninh (khóa được)'),
  65290: () => bag('kit-storage-box', 'Lockable toolbox', 'Hộp đồ nghề có khóa'),
  105905: () => bag('kit-storage-box', 'Toolbox', 'Hộp đồ nghề', L('Small', 'Nhỏ')),
  105906: () => bag('kit-storage-box', 'Toolbox', 'Hộp đồ nghề', L('Medium', 'Vừa')),
  LC584E: () => bag('kit-storage-cabinet', 'Lockout cabinet (3 shelves)', 'Tủ lockout (3 ngăn)'),
  LC977A: () => bag('kit-storage-cabinet', 'Heavy-duty lockout cabinet', 'Tủ lockout chịu lực'),
  LC252M: () => bag('kit-storage-cabinet', 'Metal lockout cabinet', 'Tủ lockout bằng kim loại', size3(16, 14, 6)),
  LC254M: () => bag('kit-storage-cabinet', 'Extra shelf for metal cabinet', 'Ngăn phụ cho tủ kim loại'),
  99021: () => bag('kit-storage-cabinet', 'Wall-mounted key cabinet', 'Tủ chìa treo tường', L('240 keys', '240 chìa')),
  95700: () => bag('kit-storage-cabinet', 'Wall-mounted key cabinet', 'Tủ chìa treo tường', L('30 keys', '30 chìa')),
  170397: () => bag('kit-station-lockout', 'Lockout station with clear door (12 locks)', 'Trạm lockout cửa trong (12 khóa)', size3(16, 14, 3.5)),
  105942: () => bag('kit-station-padlock', 'Ready-access polypropylene station', 'Trạm nhựa PP mở nhanh', size3(17, 13.25, 2.5)),
  105932: () => bag('kit-station-lockout', 'Ready-access polypropylene station', 'Trạm nhựa PP mở nhanh', size3(17, 17, 6.75)),
};
const UNFILLED = {
  50989: () => bag('kit-station-padlock', 'Acrylic padlock board', 'Bảng treo khóa acrylic', L('6 locks', '6 khóa')),
  50990: () => bag('kit-station-padlock', 'Acrylic padlock board', 'Bảng treo khóa acrylic', L('12 locks', '12 khóa')),
  50991: () => bag('kit-station-padlock', 'Acrylic padlock board', 'Bảng treo khóa acrylic', L('24 locks', '24 khóa')),
  121506: () => bag('kit-station-padlock', 'Acrylic padlock board, Spanish', 'Bảng treo khóa acrylic, tiếng Tây Ban Nha', L('24 locks', '24 khóa')),
  50992: () => bag('kit-station-padlock', 'Acrylic padlock board', 'Bảng treo khóa acrylic', L('36 locks', '36 khóa')),
  50997: () => bag('kit-station-lockout', 'Wall lockout station', 'Trạm lockout treo tường', L('Small', 'Nhỏ')),
  50994: () => bag('kit-station-lockout', 'Wall lockout station', 'Trạm lockout treo tường', L('Large', 'Lớn')),
  50993: () => bag('kit-station-lockout', 'Wall lockout station', 'Trạm lockout treo tường', L('X-Large', 'Rất lớn')),
  50996: () => bag('kit-station-lockout', 'Wall lockout station with doors', 'Trạm lockout treo tường có cửa', L('Large', 'Lớn')),
  121509: () => bag('kit-station-lockout', 'Wall lockout station with doors, Spanish', 'Trạm lockout có cửa, tiếng Tây Ban Nha', L('Large', 'Lớn')),
  50995: () => bag('kit-station-lockout', 'Wall lockout station with doors', 'Trạm lockout treo tường có cửa', L('X-Large', 'Rất lớn')),
  TH2: () => bag('kit-tag-holder', '1-pocket tag holder', 'Giá giữ thẻ 1 ngăn'),
  'TH2-H': () => bag('kit-tag-holder', '1-pocket tag holder with pen hooks', 'Giá giữ thẻ 1 ngăn có móc bút'),
  TC8: () => bag('kit-tag-holder', '8-pocket information centre', 'Bảng thông tin 8 ngăn'),
  3070: () => bag('kit-station-lockout', 'Mini electrical lockout station', 'Trạm lockout điện mini'),
  65241: () => bag('kit-storage-module', 'Enclosed padlock storage module', 'Mô-đun lưu trữ khóa có cửa', L('40 locks', '40 khóa')),
  LR008E: () => bag('kit-storage-module', 'Steel padlock control centre', 'Tủ kiểm soát khóa bằng thép', L('Small, 16 locks', 'Nhỏ, 16 khóa')),
  LR018E: () => bag('kit-storage-module', 'Steel padlock control centre', 'Tủ kiểm soát khóa bằng thép', L('Large, 32 locks', 'Lớn, 32 khóa')),
  LR060E: () => bag('kit-station-padlock', 'Steel padlock station', 'Giá treo khóa bằng thép', L('Small, 4 locks', 'Nhỏ, 4 khóa')),
  LR360E: () => bag('kit-station-padlock', 'Steel padlock station', 'Giá treo khóa bằng thép', L('Large, 24 locks', 'Lớn, 24 khóa')),
  148866: () => item('kit-carrier', L('Padlock & tag carrier', 'Giá mang khóa & thẻ'), COLOURS.Red),
  148865: () => item('kit-carrier', L('Padlock & tag carrier', 'Giá mang khóa & thẻ'), COLOURS.Yellow),
  148862: () => item('kit-carrier', L('Padlock & tag carrier', 'Giá mang khóa & thẻ'), COLOURS.Blue),
  148861: () => item('kit-carrier', L('Padlock & tag carrier', 'Giá mang khóa & thẻ'), COLOURS.Green),
  153677: () => item('kit-carrier', L('Carrier with 12 padlocks and 2 hasps', 'Giá kèm 12 khóa và 2 móc'), kd('KD')),
  153678: () => item('kit-carrier', L('Carrier with 12 padlocks and 2 hasps', 'Giá kèm 12 khóa và 2 móc'), kd('KA')),
  3013: () => bag('kit-station-lockout', 'Bilingual safety station', 'Trạm an toàn song ngữ'),
};

// ---------- cables ----------
const FT = (n, material) => L(`${n} ft ${material} cable`, `Cáp ${material === 'steel' ? 'thép' : material === 'nylon' ? 'nylon' : ''} ${n} ft`.replace('  ', ' '));
const CABLE = {
  50940: () => item('cab-mini', STD, FT(8, 'steel')), 51442: () => item('cab-mini', STD, FT(8, 'nylon')),
  65318: () => item('cab-economy', COLOURS.Red, L('6 ft cable', 'Cáp 6 ft')), 45191: () => item('cab-economy', COLOURS.Blue, L('6 ft cable', 'Cáp 6 ft')),
  45192: () => item('cab-economy', COLOURS.Yellow, L('6 ft cable', 'Cáp 6 ft')),
  CABLO: () => item('cab-economy', STD, L('6 ft cable', 'Cáp 6 ft')), 'CABLO-10': () => item('cab-economy', STD, L('10 ft cable', 'Cáp 10 ft')),
  65319: () => item('cab-parts', L('Steel cable only', 'Chỉ cáp thép'), L('8 ft', '8 ft')), 65320: () => item('cab-parts', L('Steel cable only', 'Chỉ cáp thép'), L('10 ft', '10 ft')),
  CABLE: () => item('cab-parts', L('Plastic-coated cable only', 'Chỉ cáp bọc nhựa'), L('6 ft', '6 ft')), 'CABLE-10FT': () => item('cab-parts', L('Plastic-coated cable only', 'Chỉ cáp bọc nhựa'), L('10 ft', '10 ft')),
  50941: () => item('cab-allpurpose', COLOURS.Red, FT(8, 'nylon')), 50943: () => item('cab-allpurpose', COLOURS.Red, FT(8, 'steel')),
  50944: () => item('cab-allpurpose', COLOURS.Red, L('No cable', 'Không kèm cáp')),
  170378: () => item('cab-allpurpose', COLOURS.Green, FT(8, 'steel')), 170377: () => item('cab-allpurpose', COLOURS.Green, L('No cable', 'Không kèm cáp')),
  170379: () => item('cab-parts', L('Nylon cable', 'Cáp nylon'), L('Spool', 'Cuộn')), 170409: () => item('cab-parts', L('Nylon cable', 'Cáp nylon'), L('8 ft', '8 ft')),
  122263: () => item('cab-parts', L('Steel cable', 'Cáp thép'), L('Spool', 'Cuộn')), 170408: () => item('cab-parts', L('Steel cable', 'Cáp thép'), L('8 ft', '8 ft')),
};
function spin(row) {
  const secure = /Extra Secure/.test(row.desc);
  const cable = /No Cable/.test(row.desc) ? L('no cable', 'không cáp') : L('with 59 in. cable', 'kèm cáp 59 in.');
  const type = secure ? L('Extra-secure', 'Bảo mật cao') : L('Double hex', 'Lục giác kép');
  return item('cab-spin', colourOf(row.desc.split(' - ').pop()) ?? STD, L(`${type.en}, ${cable.en}`, `${type.vi}, ${cable.vi}`));
}

// ---------- valves ----------
const GATE_SIZE = { '1 in. to 2.5 in.': [1, 2.5], '2.5 in. to 5 in.': [2.5, 5], '5 in. to 6.5 in.': [5, 6.5], '6.5 in. to 10 in.': [6.5, 10], '10 in. to 13 in.': [10, 13] };
function gate(row) {
  const size = Object.keys(GATE_SIZE).find(key => row.desc.includes(key));
  return item('vlv-gate', colourOf(row.desc), range(...GATE_SIZE[size]));
}
const VALVE = {
  64057: () => item('vlv-gate-adj', STD, range(1, 6.5)),
  148648: () => item('vlv-gate-collapsible', STD, range(3, 7)), 148647: () => item('vlv-gate-collapsible', STD, range(7, 13)), 148646: () => item('vlv-gate-collapsible', STD, range(13, 18)),
  151748: () => item('vlv-ball-tee', STD, range(0.5, 1)), 151749: () => item('vlv-ball-tee', STD, range(1.25, 2)),
  65666: () => item('vlv-ball-std', L('Nylon', 'Nylon'), range(0.25, 1), L('Shackle up to 0.28 in.', 'Còng đến 0,28 in.')),
  65692: () => item('vlv-ball-std', L('Steel', 'Thép'), range(0.25, 1), L('Shackle up to 0.375 in.', 'Còng đến 0,375 in.')),
  65669: () => item('vlv-ball-std', L('Steel', 'Thép'), range(1.25, 3), L('Shackle up to 0.28 in.', 'Còng đến 0,28 in.')),
  65693: () => item('vlv-ball-std', L('Steel', 'Thép'), range(1.25, 3), L('Shackle up to 0.375 in.', 'Còng đến 0,375 in.')),
  121540: () => item('vlv-ball-perma', STD, L('Small, 0.5–2 in.', 'Nhỏ, 0,5–2 in.')), 121541: () => item('vlv-ball-perma', STD, L('Large, 2–4 in.', 'Lớn, 2–4 in.')),
  175644: () => item('vlv-nohandle', COLOURS.Red, range(0.375, 24)), 178769: () => item('vlv-nohandle', COLOURS.Transparent, range(0.375, 24)),
  149228: () => item('vlv-flange', STD, L('Small, pipes 0.5–3 in.', 'Nhỏ, ống 0,5–3 in.')), 149229: () => item('vlv-flange', STD, L('Medium, pipes 3–14 in.', 'Vừa, ống 3–14 in.')), 149230: () => item('vlv-flange', STD, L('Large, pipes 14–48 in.', 'Lớn, ống 14–48 in.')),
  113231: () => item('vlv-plug', STD, L('Stem up to 0.875 in.', 'Trục đến 0,875 in.')), 113232: () => item('vlv-plug', STD, L('Stem 0.94–1.375 in.', 'Trục 0,94–1,375 in.')),
  113233: () => item('vlv-plug', STD, L('Stem 1.75–2.125 in.', 'Trục 1,75–2,125 in.')), 113234: () => item('vlv-plug', STD, L('Stem 2.188–2.5 in.', 'Trục 2,188–2,5 in.')),
  121504: () => item('vlv-butterfly', L('Lever handle', 'Tay gạt'), L('Small', 'Nhỏ')), 121505: () => item('vlv-butterfly', L('Lever handle', 'Tay gạt'), L('Large', 'Lớn')),
  170220: () => item('vlv-butterfly', L('Pull handle', 'Tay kéo')), 49303: () => item('vlv-butterfly', STD),
  51394: () => item('vlv-universal', L('Small device', 'Loại nhỏ'), L('8 ft sheathed steel cable', 'Cáp thép bọc 8 ft')), 51390: () => item('vlv-universal', L('Small device', 'Loại nhỏ'), FT(8, 'nylon')),
  51392: () => item('vlv-universal', L('Large device', 'Loại lớn'), L('8 ft sheathed steel cable', 'Cáp thép bọc 8 ft')), 51388: () => item('vlv-universal', L('Large device', 'Loại lớn'), FT(8, 'nylon')),
  50924: () => item('vlv-universal-parts', L('Base clamping unit', 'Bộ kẹp đế'), L('Small', 'Nhỏ')), 50899: () => item('vlv-universal-parts', L('Base clamping unit', 'Bộ kẹp đế'), L('Large', 'Lớn')),
  65402: () => item('vlv-universal-parts', L('Blocking arm', 'Cần chặn'), L('Small', 'Nhỏ')), 65403: () => item('vlv-universal-parts', L('Blocking arm', 'Cần chặn'), L('Large', 'Lớn')),
  51395: () => item('vlv-universal-parts', L('Cable attachment', 'Bộ cáp gắn thêm'), L('8 ft sheathed steel cable', 'Cáp thép bọc 8 ft')), 50932: () => item('vlv-universal-parts', L('Cable attachment', 'Bộ cáp gắn thêm'), FT(8, 'nylon')),
  50947: () => item('vlv-universal-parts', L('Sheathed steel cable', 'Cáp thép bọc'), L('8 ft', '8 ft'), ONE), 50950: () => item('vlv-universal-parts', L('Sheathed steel cable', 'Cáp thép bọc'), L('12 ft', '12 ft')),
  50953: () => item('vlv-universal-parts', L('Sheathed steel cable', 'Cáp thép bọc'), L('16 ft', '16 ft')), 50956: () => item('vlv-universal-parts', L('Sheathed steel cable', 'Cáp thép bọc'), L('20 ft', '20 ft')),
};
function legged(row) {
  const large = /^BS08/.test(row.sku);
  const colour = { RD: COLOURS.Red, YW: COLOURS.Yellow, BU: COLOURS.Blue, GN: COLOURS.Green }[row.sku.split('-')[1]];
  return item('vlv-ball-4leg', colour, large ? L('Large, 2–8 in.', 'Lớn, 2–8 in.') : L('Small, 0.5–2.5 in.', 'Nhỏ, 0,5–2,5 in.'));
}

// ---------- electrical ----------
const E = (concept, fam, qty = 1, dim = STD) => item(concept, fam, dim, pack(qty), qty);
const V120 = L('120/277 V', '120/277 V'), V480 = L('480/600 V', '480/600 V');
const V120S = L('120/277 V, slide cover', '120/277 V, nắp trượt'), V480S = L('480/600 V, slide cover', '480/600 V, nắp trượt');
const MCB = {
  149514: ['Universal fit', 'Đa năng', 1], 149515: ['Universal fit', 'Đa năng', 6], 149433: ['For ABB MS325', 'Cho ABB MS325', 1], 149434: ['For ABB MS325', 'Cho ABB MS325', 6],
  90844: ['Pin-out standard', 'Chốt ra tiêu chuẩn', 1], 90845: ['Pin-out standard', 'Chốt ra tiêu chuẩn', 6], 90847: ['Pin-in standard', 'Chốt vào tiêu chuẩn', 1], 90848: ['Pin-in standard', 'Chốt vào tiêu chuẩn', 6],
  90850: ['Pin-out wide', 'Chốt ra loại rộng', 1], 90851: ['Pin-out wide', 'Chốt ra loại rộng', 6], 177243: ['Rotary switch', 'Công tắc xoay', 1], 90853: ['Tie-bar', 'Thanh nối', 1], 90854: ['Tie-bar', 'Thanh nối', 6],
};
const ELECTRICAL = {
  151633: () => E('ele-panel-cable', STD),
  65329: () => E('ele-oversized', STD, 1), 65321: () => E('ele-oversized', STD, 6), 148692: () => E('ele-oversized', STD, 1), 148691: () => E('ele-oversized', STD, 6), 148685: () => E('ele-oversized', STD, 25),
  176495: () => E('ele-clamp', V120S, 1), 176496: () => E('ele-clamp', V120S, 6), 176497: () => E('ele-clamp', V480S, 1), 176498: () => E('ele-clamp', V480S, 6),
  148690: () => E('ele-clamp', V120, 1), 148698: () => E('ele-clamp', V120, 6), 148699: () => E('ele-clamp', V120, 50),
  148701: () => E('ele-clamp', V480, 1), 148687: () => E('ele-clamp', V480, 6), 148686: () => E('ele-clamp', V480, 25),
  177594: () => E('ele-cleats', V120, 6), 177595: () => E('ele-cleats', V480, 6), 77594: () => E('ele-cleats', V120, 6),
  65387: () => E('ele-snap120', STD, 1), 65688: () => E('ele-snap120', STD, 6), 148689: () => E('ele-snap120', STD, 1), 148693: () => E('ele-snap120', STD, 6), 148694: () => E('ele-snap120', STD, 50),
  66321: () => E('ele-multipole', STD, 1), 66320: () => E('ele-multipole', STD, 6), 148702: () => E('ele-multipole', STD, 1), 148697: () => E('ele-multipole', STD, 6), 148695: () => E('ele-multipole', STD, 50),
  148696: () => E('ele-holed', STD, 1), 148688: () => E('ele-holed', STD, 6), 148700: () => E('ele-holed', STD, 50),
  177547: () => E('ele-low', STD, 1), 177548: () => E('ele-low', STD, 6),
  51256: () => E('ele-ez-rail', L('4 in. lock rail (7 loops)', 'Thanh khóa 4 in. (7 vòng)'), 1), 65814: () => E('ele-ez-rail', L('4 in. lock rail (7 loops)', 'Thanh khóa 4 in. (7 vòng)'), 6),
  51258: () => E('ele-ez-rail', L('8 in. lock rail (15 loops)', 'Thanh khóa 8 in. (15 vòng)'), 1), 51260: () => E('ele-ez-rail', L('8 in. lock rail (15 loops)', 'Thanh khóa 8 in. (15 vòng)'), 6),
  89256: () => E('ele-ez-rail', L('Spacing gasket (15 ft)', 'Gioăng đệm (15 ft)'), 1),
  51254: () => E('ele-ez-clamp', STD, 1), 65810: () => E('ele-ez-clamp', STD, 6), 51252: () => E('ele-ez-snap', STD, 1), 65815: () => E('ele-ez-snap', STD, 6),
  90891: () => E('ele-blocker', L('Starter kit', 'Bộ khởi đầu'), 1), 90892: () => E('ele-blocker', L('Red blocking bar, 7.6 in.', 'Thanh chặn đỏ 7,6 in.'), 5),
  90893: () => E('ele-blocker', L('Green blocking bar, 7.6 in.', 'Thanh chặn xanh 7,6 in.'), 5), 51264: () => E('ele-blocker', L('Yellow mounting rails, 4 in.', 'Thanh gắn vàng 4 in.'), 2), 51265: () => E('ele-blocker', L('Blocking bar holder', 'Giá giữ thanh chặn'), 5),
};

// ---------- switches, gas & air ----------
const PBL = { PBL6: ['Push button', 'Nút nhấn', 'NEMA 30.5 mm'], PBL8: ['Push button', 'Nút nhấn', 'IEC 22.5 mm'], PBL2: ['Emergency stop', 'Nút dừng khẩn', 'NEMA 30.5 mm'], PBL4: ['Emergency stop', 'Nút dừng khẩn', 'IEC 22.5 mm'] };
const PBBASE = {
  134018: ['Red', '16 mm', 'Short cover', 'Nắp ngắn'], 130819: ['Red', '16 mm', 'Tall cover', 'Nắp cao'], 130820: ['Red', '22 mm', 'Medium cover', 'Nắp vừa'], 130821: ['Red', '30 mm', 'Medium cover', 'Nắp vừa'],
  139793: ['Clear', '16 mm', 'Short cover', 'Nắp ngắn'], 139794: ['Clear', '16 mm', 'Tall cover', 'Nắp cao'], 139795: ['Clear', '22 mm', 'Medium cover', 'Nắp vừa'], 139796: ['Clear', '30 mm', 'Medium cover', 'Nắp vừa'],
};
const COVERS = {
  150587: () => item('sga-pendant', L('Pendant control cover', 'Nắp tay điều khiển treo'), L('Expands to 18 in.', 'Mở rộng đến 18 in.')),
  151252: () => item('sga-pendant', L('Pendant control cover', 'Nắp tay điều khiển treo'), L('Expands to 39 in.', 'Mở rộng đến 39 in.')),
  130822: () => item('sga-pb-base', L('Extra bases (clear)', 'Đế rời (trong)'), L('16 mm', '16 mm'), pack(5), 5), 130823: () => item('sga-pb-base', L('Extra bases (clear)', 'Đế rời (trong)'), L('22 mm', '22 mm'), pack(5), 5), 130824: () => item('sga-pb-base', L('Extra bases (clear)', 'Đế rời (trong)'), L('30 mm', '30 mm'), pack(5), 5),
  104602: () => item('sga-pb-cover', L('Clear hinged cover with legend plate', 'Nắp trong bản lề kèm bảng chú thích')), 104603: () => item('sga-pb-cover', L('Clear and metal hinged cover', 'Nắp trong + kim loại bản lề')),
  65392: () => item('sga-wall-switch', STD, STD, pack(1)), 65696: () => item('sga-wall-switch', STD, STD, pack(6), 6),
  64221: () => item('sga-pneumatic', STD, STD, pack(1)), 65645: () => item('sga-pneumatic', STD, STD, pack(6), 6),
  90496: () => item('sga-gas-cap', L('High pressure', 'Áp suất cao'), L('Fine thread', 'Ren mịn')), 95137: () => item('sga-gas-cap', L('Low pressure', 'Áp suất thấp'), L('Fine thread', 'Ren mịn')),
  95138: () => item('sga-gas-cap', L('High pressure', 'Áp suất cao'), L('Coarse thread', 'Ren thô')), 95139: () => item('sga-gas-cap', L('Low pressure', 'Áp suất thấp'), L('Coarse thread', 'Ren thô')),
  64539: () => item('sga-regulator', L('For AR2000 / NAR2000 regulators', 'Cho bộ điều áp AR2000 / NAR2000')), 64540: () => item('sga-regulator', L('For AR3000 / NAR3000 regulators', 'Cho bộ điều áp AR3000 / NAR3000')),
};

// ---------- fuse & plug ----------
const FUSE = {
  65750: () => E('fus-lockout', STD, 6, L('13/32 in.', '13/32 in.')), 65751: () => E('fus-lockout', STD, 6, L('9/16 in.', '9/16 in.')),
  65690: () => E('fus-blockout', STD, 6, L('Small', 'Nhỏ')), 65691: () => E('fus-blockout', STD, 6, L('Large', 'Lớn')), 873367: () => E('fus-universal', STD),
  149280: () => E('fus-block', L('0.56 in. fuse blocks', 'Khối cầu chì 0,56 in.'), 2), 149281: () => E('fus-block', L('0.56 in. fuse blocks', 'Khối cầu chì 0,56 in.'), 50),
  149282: () => E('fus-block', L('Modular fuse blocks (USSC2)', 'Khối cầu chì module (USSC2)'), 2), 149283: () => E('fus-block', L('Modular fuse blocks (USSC2)', 'Khối cầu chì module (USSC2)'), 50),
  149284: () => E('fus-block', L('NEC fuse blocks (GE type)', 'Khối cầu chì NEC (kiểu GE)'), 2), 149285: () => E('fus-block', L('NEC fuse blocks (GE type)', 'Khối cầu chì NEC (kiểu GE)'), 50),
  149278: () => E('fus-block', L('Terminal blocks', 'Khối đầu nối'), 2), 149279: () => E('fus-block', L('Terminal blocks', 'Khối đầu nối'), 50),
};
const PLUG = {
  150841: () => E('plg-forklift', STD), 177588: () => E('plg-ev', L('Charging port lockout', 'Khóa cổng sạc')), 177589: () => E('plg-ev', L('Charging plug lockout (NACS)', 'Khóa đầu sạc (NACS)')),
  178770: () => E('plg-gladhand', STD, 1), 178950: () => E('plg-gladhand', STD, 6),
  151874: () => E('plg-steering', STD, 1, L('12 in.', '12 in.')), 151875: () => E('plg-steering', STD, 1, L('16 in.', '16 in.')), 151876: () => E('plg-steering', STD, 1, L('20 in.', '20 in.')),
  150820: () => E('plg-batterycable', STD, 1, L('Small', 'Nhỏ')), 150822: () => E('plg-batterycable', STD, 24, L('Small', 'Nhỏ')), 150821: () => E('plg-batterycable', STD, 1, L('Large', 'Lớn')), 150823: () => E('plg-batterycable', STD, 24, L('Large', 'Lớn')),
  148081: () => E('plg-iec', STD), 65695: () => E('plg-heavy', STD, 1, L('Small', 'Nhỏ')), 65968: () => E('plg-heavy', STD, 1, L('Large', 'Lớn')),
  65674: () => E('plg-electrical', STD, 1, L('Small, 110 V', 'Nhỏ, 110 V')), 65675: () => E('plg-electrical', STD, 1, L('Large, 220/500 V', 'Lớn, 220/500 V')),
  PLO23: () => E('plg-3in1', STD), PLO27E: () => E('plg-elec-pneu', STD),
};

// ---------- confined space ----------
const SIGN = {
  43754: ['Danger – enter by permit only', 'Nguy hiểm – chỉ vào khi có giấy phép', size2(21, 30)],
  43753: ['Danger – entry can be fatal, follow all procedures', 'Nguy hiểm – vào có thể tử vong, tuân thủ quy trình', size2(21, 30)],
  43760: ['Caution – do not enter without a permit', 'Cảnh báo – không vào khi chưa có giấy phép', size2(21, 30)],
  43759: ['Danger – call your supervisor', 'Nguy hiểm – gọi người giám sát', size2(21, 30)],
  47198: ['Danger – call your supervisor', 'Nguy hiểm – gọi người giám sát', size2(30.5, 42)],
};
const ELASTIC = { 177438: 18, 177439: 22, 177440: 30, 177441: 36, 177442: 42 };
const MAGNETIC = { 177433: ['X-Small', 'Rất nhỏ', 20], 177434: ['Small', 'Nhỏ', 20], 177435: ['Medium', 'Vừa', 28], 177436: ['Large', 'Lớn', 28], 177437: ['X-Large', 'Rất lớn', 34] };

// ---------- tags ----------
const MATERIAL = {
  'B-837': L('Heavy-duty polyester', 'Polyester cao cấp'), 'B-851': L('Economy polyester', 'Polyester tiết kiệm'), 'B-853': L('Cardstock', 'Giấy bìa cứng'),
};
const ENERGY = {
  CP: L('Control panel', 'Bảng điều khiển'), E: L('Electrical', 'Điện'), G: L('Gas', 'Khí'), P: L('Pneumatic / air', 'Khí nén'),
  V: L('Valve', 'Van'), W: L('Water', 'Nước'),
};
const SPECIAL = {
  150502: ['Roll style 1', 'Cuộn kiểu 1', L('Roll of 250', 'Cuộn 250')], 150501: ['Roll style 1', 'Cuộn kiểu 1', L('Roll of 100', 'Cuộn 100')],
  150504: ['Roll style 2', 'Cuộn kiểu 2', L('Roll of 250', 'Cuộn 250')], 150503: ['Roll style 2', 'Cuộn kiểu 2', L('Roll of 100', 'Cuộn 100')],
  145766: ['Washdown tag, style 1', 'Thẻ chịu rửa, kiểu 1', pack(10)], 145767: ['Washdown tag, style 2', 'Thẻ chịu rửa, kiểu 2', pack(10)],
  145768: ['Washdown tag, style 3', 'Thẻ chịu rửa, kiểu 3', pack(10)], 145769: ['Washdown tag, style 4', 'Thẻ chịu rửa, kiểu 4', pack(10)],
  145588: ['Metal-detectable ties, 7 in.', 'Dây rút dò kim loại 7 in.', pack(10)], 145589: ['Metal-detectable ties, 7 in.', 'Dây rút dò kim loại 7 in.', pack(100)],
  121514: ['Tag style 1', 'Thẻ kiểu 1', pack(25), 'B-851'], 98219: ['Tag style 1', 'Thẻ kiểu 1', pack(25), 'B-837'],
  121515: ['Language tag set A', 'Thẻ ngôn ngữ, bộ A', pack(25), 'B-837'], 121516: ['Language tag set A', 'Thẻ ngôn ngữ, bộ A', pack(25), 'B-851'], 121517: ['Language tag set A', 'Thẻ ngôn ngữ, bộ A', pack(25), 'B-853'],
  121518: ['Language tag set B', 'Thẻ ngôn ngữ, bộ B', pack(25), 'B-837'], 121519: ['Language tag set B', 'Thẻ ngôn ngữ, bộ B', pack(25), 'B-851'], 121520: ['Language tag set B', 'Thẻ ngôn ngữ, bộ B', pack(25), 'B-853'],
};

/** @returns {{concept,fam,dim,ed,qty}|{skip:string}|null} */
export function bradyItem(row) {
  const { sub, sku, desc } = row;
  if (/Velocity/.test(sub)) return padlock(sku);
  if (sub === 'Padlock Labels') return label(row);
  if (sub === 'Permit Control Stations') {
    const fam = /26 Group/.test(desc) ? L('With 26-lock group box', 'Kèm hộp khóa nhóm 26 khóa') : /SlimView/.test(desc) ? L('With slim 12-lock box', 'Kèm hộp mỏng 12 khóa')
      : /Ultra/.test(desc) ? L('With ultra-compact box', 'Kèm hộp siêu nhỏ') : L('Display case only', 'Chỉ hộp đựng giấy phép');
    return item('grp-permit', fam);
  }
  if (sub === 'Ultra-Compact Group Lock Box') return item('grp-box-ultra', COLOURS.Red, /without/.test(desc) ? L('Box only', 'Chỉ hộp') : /Alike/.test(desc) ? L('With 6 keyed-alike locks', 'Kèm 6 khóa cùng chìa') : L('With 6 keyed-different locks', 'Kèm 6 khóa khác chìa'));
  if (sub === '26 Group Lock Box') return item('grp-box-lock', colourOf(desc), L('26 locks', '26 khóa'));
  if (sub === 'Portable Metal Group Lockout Box') {
    const medium = /Medium/.test(desc);
    return item('grp-box-portable', colourOf(desc), medium ? L('Medium, 6 × 8.9 × 7 in.', 'Vừa, 6 × 8,9 × 7 in.') : L('Small, 6 × 8.9 × 3.5 in.', 'Nhỏ, 6 × 8,9 × 3,5 in.'), /Spanish/.test(desc) ? L('Spanish labels', 'Nhãn tiếng Tây Ban Nha') : L('English labels', 'Nhãn tiếng Anh'));
  }
  if (sub === 'Lock Storage / Group Lockout Box') return item('grp-box-storage', COLOURS.Red, /XL/.test(desc) ? L('XL, 12 × 9 × 8.25 in.', 'XL, 12 × 9 × 8,25 in.') : L('Large, 12 × 6.75 × 8.25 in.', 'Lớn, 12 × 6,75 × 8,25 in.'));
  if (sub === 'Metal Group Lockout Box (Small/Large)') return item('grp-box-portable', COLOURS.Red, /Large/.test(desc) ? L('Large', 'Lớn') : L('Small', 'Nhỏ'));
  if (sub === 'Metal Wall-Mounted Group Lockout Box') return item('grp-box-portable', COLOURS.Yellow, L('Wall-mounted', 'Treo tường'));
  if (sub === 'SlimView Group Lock Box') return item('grp-box-slim', colourOf(desc));
  if (sub === 'Group Lockout Hasps') return groupHasp(sku);
  if (sub === 'Labeled Group Lockout Hasps') return item('grp-hasp-labeled', colourOf(desc) ?? COLOURS.Combo, L(`Style ${STYLE_BY_SKU[sku]}`, `Kiểu ${STYLE_BY_SKU[sku]}`), pack(5), 5);
  if (sub === 'Lockout Tagout Kits') return item('kit-loto', L(...KIT[sku]));
  if (sub === 'Board Stations (filled)' || sub === 'Cabinet Stations (filled)') return item('kit-station-filled', L(FILLED[sku][0], FILLED[sku][1]), kd(FILLED[sku][2]));
  if (sub === 'Lockout & Padlock Storage') return STORAGE[sku]();
  if (sub.startsWith('Unfilled')) return UNFILLED[sku]();
  if (sub === 'Spin Lockout System') return spin(row);
  if (sub.includes('Cable Lockout')) { if (CABLE[sku]) return CABLE[sku](); }
  if (sub === 'Gate Valve Lockout') return gate(row);
  if (['4-Legged Ball Valve Lockout'].includes(sub)) return legged(row);
  if (VALVE[sku]) return VALVE[sku]();
  if (ELECTRICAL[sku]) return ELECTRICAL[sku]();
  if (MCB[sku]) { const [en, vi, qty] = MCB[sku]; return E('ele-mcb', L(en, vi), qty); }
  if (sub === 'Push Button & E-Stop Safety Covers (base+cover)' && PBBASE[sku]) {
    const [colour, size, en, vi] = PBBASE[sku];
    return item('sga-pb-base', colour === 'Red' ? L('Red cover', 'Nắp đỏ') : L('Clear cover', 'Nắp trong'), L(size, size), L(en, vi));
  }
  if (PBL[sku]) { const [en, vi, size] = PBL[sku]; return item('sga-pb-cover', L(en, vi), L(size, size)); }
  if (COVERS[sku]) return COVERS[sku]();
  if (FUSE[sku]) return FUSE[sku]();
  if (PLUG[sku]) return PLUG[sku]();
  if (sub === 'Covers & Signs') {
    if (ELASTIC[sku]) return item('csp-cover-elastic', STD, L(`Fits ${ELASTIC[sku]} in. opening`, `Vừa miệng ${ELASTIC[sku]} in.`));
    if (MAGNETIC[sku]) { const [en, vi, size] = MAGNETIC[sku]; return item('csp-cover-magnetic', STD, L(`${en}, up to ${size} in.`, `${vi}, đến ${size} in.`)); }
    if (SIGN[sku]) { const [en, vi, dim] = SIGN[sku]; return item('csp-sign', L(en, vi), dim); }
  }
  if (sub === 'Standard Lockout Tags') return null; // handled by standardTags()
  if (sub === 'Energy Source Tags') {
    const m = desc.match(/^(CP|E|G|P|S|V|W)-(\d) (.+?) on (.+?) (\d+)$/);
    if (!m) return null;
    const [, code, number, fg, bg, qty] = m;
    let fam = ENERGY[code];
    if (code === 'S') fam = bg === 'Red' ? L('Steam (red)', 'Hơi nước (đỏ)') : L('Steam (orange)', 'Hơi nước (cam)');
    return item('tag-energy', fam, L(`Number ${number}`, `Số ${number}`), pack(Number(qty)), Number(qty));
  }
  if (sub.startsWith('Specialized')) {
    const [en, vi, ed, material] = SPECIAL[sku];
    return item('tag-specialty', L(en, vi), material ? MATERIAL[material] : STD, ed, Number(ed.en.match(/\d+/)?.[0] ?? 1));
  }
  if (sub === 'Self-Laminating Photo Tags') {
    const sized = sku === '96222' ? size2(7, 4) : size2(5.75, 3);
    const laminated = sku !== '65500';
    return item('tag-photo', laminated ? L('With laminate', 'Có màng ép') : L('Unlaminated', 'Không màng ép'), sized, pack(laminated ? 10 : 25), laminated ? 10 : 25);
  }
  if (sub === 'Mini Safety Lockout Tags & Fasteners') return sku === '148824' ? item('tag-mini', L('Mini tag, 2.5 × 2 in.', 'Thẻ mini 2,5 × 2 in.'), STD, pack(25), 25) : item('tag-mini', L('Nylon fasteners, 7 in.', 'Dây rút nylon 7 in.'), STD, pack(100), 100);
  if (sub === 'Two-Part Perforated Tags') {
    const legend = /Do Not Operate/.test(desc) ? L('Do not operate', 'Không vận hành') : L('Locked out', 'Đang khóa');
    return item('tag-twopart', legend, /polyester/.test(desc) ? L('Polyester, 7.5 × 4 in.', 'Polyester, 7,5 × 4 in.') : L('Cardstock, 7.5 × 4 in.', 'Giấy bìa cứng, 7,5 × 4 in.'), pack(25), 25);
  }
  if (sub === 'Custom-Legend Tags') return item('tag-legend', /Do Not Operate/.test(desc) ? L('Do not operate', 'Không vận hành') : L('Equipment locked out', 'Thiết bị đang khóa'), size2(5.75, 3), pack(25), 25);
  if (sub === 'Padlock Tags') {
    const fam = /English\/Spanish/.test(desc) ? L('Do not operate, English / Spanish', 'Không vận hành, Anh / Tây Ban Nha') : /Do Not Operate/.test(desc) ? L('Do not operate', 'Không vận hành') : L('Equipment locked out', 'Thiết bị đang khóa');
    return item('tag-padlock', fam, size2(3, 2));
  }
  return null;
}

/** Standard tag grid: 10 designs × 3 materials × 3 reverse legends. */
export function standardTags(rows) {
  const material = ['B-837', 'B-837', 'B-837', 'B-851', 'B-851', 'B-851', 'B-853', 'B-853', 'B-853'];
  const grouped = new Map(); // SKU -> tuple
  const ordered = rows.filter(row => row.sub === 'Standard Lockout Tags');
  ordered.forEach((row, index) => {
    const design = Math.floor(index / 9) + 1, slot = index % 9;
    const side = row.desc.match(/reverse legend Side ([BFG])/)?.[1] ?? 'B';
    grouped.set(row.sku, item('tag-standard', L(`Design ${design}`, `Mẫu ${design}`), MATERIAL[material[slot]],
      L(`Reverse legend ${side}`, `Mặt sau ${side}`), 25));
  });
  return grouped;
}
