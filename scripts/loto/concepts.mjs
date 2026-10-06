// Categories (step 1) and product types ("concepts", step 2) of the Lockout Tagout shop, EN + VI.
// Every product belongs to exactly one concept. `analog` lists the Handyman products whose price is the
// basis for estimating Brady-range items that have no Handyman price (median of the listed refs, per piece),
// `factor` scales it. Concepts with their own priced Handyman items use those automatically.

export const CATEGORIES = [
  ['lockout-padlocks', 'Lockout padlocks', 'Khóa an toàn lockout', 'PAD'],
  ['group-lockout', 'Group lockout', 'Khóa nhóm', 'GRP'],
  ['kits-stations', 'Kits & stations', 'Bộ kit & trạm lockout', 'KIT'],
  ['cable-lockouts', 'Cable lockouts', 'Khóa cáp lockout', 'CAB'],
  ['valve-lockouts', 'Valve lockouts', 'Khóa van lockout', 'VLV'],
  ['electrical-lockouts', 'Electrical lockouts', 'Khóa thiết bị điện', 'ELE'],
  ['switch-gas-air', 'Switch, gas & air lockouts', 'Khóa công tắc, khí & hơi', 'SGA'],
  ['fuse-terminal', 'Fuse & terminal lockouts', 'Khóa cầu chì & đầu nối', 'FUS'],
  ['plug-vehicle', 'Plug & vehicle lockouts', 'Khóa phích cắm & phương tiện', 'PLG'],
  ['confined-space', 'Confined space covers', 'Nắp & biển không gian hạn chế', 'CSP'],
  ['lockout-tags', 'Lockout tags', 'Thẻ lockout tagout', 'TAG'],
];

const PADLOCK = ['GS PJRS-KD', 'GS PJLS-KD'];
const HASP = ['GS EHASP - 02', 'GS D-HASP-S3'];
const CABLE = ['GS MCL-01', 'GS MCL-03'];
const BREAKER = ['GS CBL-SP-01', 'GS CBL-MP-01'];
const STATION = ['GS PS-12', 'GS LS-12210'];
const BOX = ['GS GLB 13SS', 'GS GLB-S26'];
const TAG = ['GS S-TAG', 'GS S-TAG-7'];

// [id, category id, EN, VI, analog refs, factor]
const RAW = [
  // Padlocks
  ['pad-nylon-steel', 'lockout-padlocks', 'Safety padlock, nylon body, steel shackle', 'Khóa an toàn thân nylon, còng thép', PADLOCK, 1],
  ['pad-nylon-nylon', 'lockout-padlocks', 'Safety padlock, nylon body, non-conductive shackle', 'Khóa an toàn thân nylon, còng nylon không dẫn điện', PADLOCK, 1.15],
  ['pad-alu', 'lockout-padlocks', 'Safety padlock, aluminium body', 'Khóa an toàn thân nhôm', PADLOCK, 1.25],
  ['pad-compact-nylon', 'lockout-padlocks', 'Compact safety padlock, nylon body', 'Khóa an toàn nhỏ gọn thân nylon', PADLOCK, 0.9],
  ['pad-compact-alu', 'lockout-padlocks', 'Compact safety padlock, aluminium body', 'Khóa an toàn nhỏ gọn thân nhôm', PADLOCK, 1.1],
  ['pad-jacket', 'lockout-padlocks', 'Safety padlock, insulated jacket', 'Khóa an toàn có vỏ bọc cách điện', PADLOCK, 1],
  ['pad-cable', 'lockout-padlocks', 'Cable safety padlock', 'Khóa an toàn dây cáp', ['GS SLPC-3F'], 1],
  ['pad-labels', 'lockout-padlocks', 'Padlock labels', 'Nhãn dán khóa', TAG, 0.6],
  // Group lockout
  ['grp-permit', 'group-lockout', 'Permit control station', 'Trạm kiểm soát giấy phép lockout', BOX, 1.7],
  ['grp-box-ultra', 'group-lockout', 'Ultra-compact group lock box', 'Hộp khóa nhóm siêu nhỏ', BOX, 0.45],
  ['grp-box-lock', 'group-lockout', 'Group lockout box (by lock capacity)', 'Hộp khóa nhóm (theo số khóa)', BOX, 1],
  ['grp-box-key', 'group-lockout', 'Group lockout key box', 'Hộp khóa nhóm cho chìa', ['GS GLK-1', 'GS GLK-2'], 1],
  ['grp-box-portable', 'group-lockout', 'Portable metal group lockout box', 'Hộp khóa nhóm kim loại di động', BOX, 0.9],
  ['grp-box-storage', 'group-lockout', 'Lock storage / group lockout box', 'Hộp lưu trữ khóa / khóa nhóm', BOX, 1.3],
  ['grp-box-slim', 'group-lockout', 'Slim group lock box (12 locks)', 'Hộp khóa nhóm mỏng (12 khóa)', BOX, 1],
  ['grp-hasp', 'group-lockout', 'Group lockout hasp', 'Móc khóa nhóm', HASP, 1],
  ['grp-hasp-labeled', 'group-lockout', 'Labelled group lockout hasp', 'Móc khóa nhóm có nhãn ghi', HASP, 1.5],
  // Kits & stations
  ['kit-loto', 'kits-stations', 'Lockout tagout kit', 'Bộ kit lockout tagout', ['V-VLK', 'V-P2-R'], 1],
  ['kit-station-filled', 'kits-stations', 'Lockout station with padlocks', 'Trạm lockout kèm khóa', ['GS-LTS 6', 'GS-LTS 9'], 2.2],
  ['kit-storage-bag', 'kits-stations', 'Lockout bags & pouches', 'Túi & bao đựng đồ lockout', ['V-P2-R'], 0.25],
  ['kit-storage-box', 'kits-stations', 'Lockout toolboxes', 'Hộp đồ nghề lockout', ['V-P2-R'], 0.35],
  ['kit-storage-cabinet', 'kits-stations', 'Lockout cabinets', 'Tủ lockout', ['GS SLC-5L', 'GS H-T-C'], 1],
  ['kit-station-padlock', 'kits-stations', 'Padlock station / board', 'Bảng treo khóa / trạm khóa', STATION, 1],
  ['kit-station-lockout', 'kits-stations', 'Lockout tagout station', 'Trạm lockout tagout', ['GS-LTS 6', 'GS-LTS 9'], 1],
  ['kit-tag-holder', 'kits-stations', 'Tag holders', 'Giá giữ thẻ', STATION, 0.5],
  ['kit-carrier', 'kits-stations', 'Padlock & tag carrier', 'Giá mang khóa & thẻ', STATION, 1.2],
  ['kit-storage-module', 'kits-stations', 'Padlock control centre', 'Tủ kiểm soát khóa', STATION, 1.6],
  // Cable
  ['cab-handyman', 'cable-lockouts', 'Cable lockout', 'Khóa cáp lockout', CABLE, 1],
  ['cab-allpurpose', 'cable-lockouts', 'All-purpose cable lockout', 'Khóa cáp đa năng', CABLE, 1.1],
  ['cab-mini', 'cable-lockouts', 'Mini cable lockout (self-winding)', 'Khóa cáp mini tự cuộn', CABLE, 1.2],
  ['cab-economy', 'cable-lockouts', 'Economy cable lockout', 'Khóa cáp tiết kiệm', CABLE, 0.9],
  ['cab-spin', 'cable-lockouts', 'Spin cable lockout system', 'Khóa cáp xoay', CABLE, 1.2],
  ['cab-parts', 'cable-lockouts', 'Lockout cables & spools', 'Cáp & cuộn cáp lockout', CABLE, 0.5],
  // Valves
  ['vlv-gate', 'valve-lockouts', 'Gate valve lockout', 'Khóa van cổng', ['GS GVL-04', 'GS GVL-06', 'GS GVL-08', 'GS GVL-10'], 1],
  ['vlv-gate-adj', 'valve-lockouts', 'Adjustable gate valve lockout', 'Khóa van cổng điều chỉnh', ['GS GVL-08'], 1.1],
  ['vlv-gate-collapsible', 'valve-lockouts', 'Collapsible gate valve lockout', 'Khóa van cổng gấp gọn', ['GS GVL-08'], 1.2],
  ['vlv-ball-tee', 'valve-lockouts', 'T-handle ball valve lockout', 'Khóa van bi tay chữ T', ['GS BVL-01'], 1],
  ['vlv-ball-std', 'valve-lockouts', 'Ball valve lockout (one-piece)', 'Khóa van bi (một khối)', ['GS BVL-01'], 0.9],
  ['vlv-ball', 'valve-lockouts', 'Ball valve lockout', 'Khóa van bi', ['GS BVL-01', 'GS BVL-L'], 1],
  ['vlv-ball-4leg', 'valve-lockouts', 'Ball valve lockout, 4-legged', 'Khóa van bi 4 chân', ['GS BVL-01', 'GS BVL-L'], 1],
  ['vlv-ball-perma', 'valve-lockouts', 'Permanent-mount ball valve lockout', 'Khóa van bi lắp cố định', ['GS BVL-L'], 1.3],
  ['vlv-ball-arm', 'valve-lockouts', 'Arm for settable ball valve lockout', 'Cần cho khóa van bi chỉnh được', ['GS VL-ARM-S', 'GS VL-ARM-L'], 1],
  ['vlv-nohandle', 'valve-lockouts', 'No-handle valve lockout with cable', 'Khóa van không tay gạt kèm cáp', ['GS BVL-L'], 1.5],
  ['vlv-universal', 'valve-lockouts', 'Universal valve lockout', 'Khóa van vạn năng', ['GS BVL-L'], 1.6],
  ['vlv-universal-parts', 'valve-lockouts', 'Universal valve lockout parts', 'Phụ tùng khóa van vạn năng', ['GS BVL-01'], 0.6],
  ['vlv-flange', 'valve-lockouts', 'Pipe blind flange lockout', 'Khóa mặt bích mù đường ống', ['GS BVL-L'], 1.6],
  ['vlv-plug', 'valve-lockouts', 'Plug valve lockout', 'Khóa van nút', ['GS BVL-01'], 1.1],
  ['vlv-butterfly', 'valve-lockouts', 'Butterfly valve lockout', 'Khóa van bướm', ['GS BFVL'], 1],
  ['vlv-cylinder', 'valve-lockouts', 'Gate valve cylinder lockout', 'Khóa xi lanh van cổng', ['GS GVLC'], 1],
  ['vlv-combo', 'valve-lockouts', 'Cable + butterfly valve lockout set', 'Bộ khóa cáp + khóa van bướm', ['CBL-01-2M+BFVL-U'], 1],
  // Electrical
  ['ele-panel-cable', 'electrical-lockouts', 'Panel cable lockout', 'Khóa tủ điện bằng cáp', BREAKER, 1.3],
  ['ele-clamp', 'electrical-lockouts', 'Clamp-on circuit breaker lockout', 'Khóa aptomat kẹp', BREAKER, 1],
  ['ele-oversized', 'electrical-lockouts', 'Oversized breaker lockout (480–600 V)', 'Khóa aptomat cỡ lớn (480–600 V)', ['GS CBLU-BIG'], 1],
  ['ele-snap120', 'electrical-lockouts', '120 V snap-on breaker lockout', 'Khóa aptomat 120 V gài nhanh', BREAKER, 0.9],
  ['ele-multipole', 'electrical-lockouts', 'Multi-pole breaker lockout', 'Khóa aptomat nhiều cực', ['GS CBL-MP-01'], 1],
  ['ele-holed', 'electrical-lockouts', 'Breaker lockout for holed-tongue switches', 'Khóa aptomat cần có lỗ', BREAKER, 0.9],
  ['ele-cleats', 'electrical-lockouts', 'Extra cleats for breaker lockouts', 'Miếng đệm phụ cho khóa aptomat', BREAKER, 0.3],
  ['ele-low', 'electrical-lockouts', 'Low-profile breaker lockout', 'Khóa aptomat mỏng', BREAKER, 0.9],
  ['ele-ez-rail', 'electrical-lockouts', 'Panel lock rail system', 'Thanh khóa gắn tủ điện', BREAKER, 0.8],
  ['ele-ez-clamp', 'electrical-lockouts', 'Panel-mount clamp-on breaker lockout', 'Khóa aptomat kẹp kèm thanh khóa', BREAKER, 1],
  ['ele-ez-snap', 'electrical-lockouts', 'Panel-mount snap-on breaker lockout', 'Khóa aptomat gài kèm thanh khóa', BREAKER, 1],
  ['ele-blocker', 'electrical-lockouts', 'Breaker blocking system (480–600 V)', 'Hệ thanh chặn aptomat (480–600 V)', BREAKER, 1.6],
  ['ele-mcb', 'electrical-lockouts', 'Miniature circuit breaker lockout', 'Khóa aptomat loại nhỏ (MCB)', ['GS CBL-ABB', 'GS CBL-EU-R'], 1],
  ['ele-breaker-hm', 'electrical-lockouts', 'Circuit breaker lockout (Handyman range)', 'Khóa aptomat (dòng Handyman)', BREAKER, 1],
  ['ele-breaker-set', 'electrical-lockouts', 'Circuit breaker lockout sets', 'Bộ khóa aptomat', ['GS CBLS COMBO 3'], 1],
  ['ele-fire', 'electrical-lockouts', 'Fire alarm circuit lockout kit', 'Bộ khóa mạch báo cháy', ['GS CBL-MFU'], 1.5],
  ['ele-panel', 'electrical-lockouts', 'Electrical panel lockout', 'Khóa công tắc / tủ điện', ['GS EPL - 45', 'GS EPL - SS'], 1],
  // Switch, gas & air
  ['sga-pendant', 'switch-gas-air', 'Pendant & hoist controller cover', 'Nắp bảo vệ tay điều khiển treo / cầu trục', ['GS EPL-HL-1'], 1],
  ['sga-pb-base', 'switch-gas-air', 'Push button safety cover (base + cover)', 'Nắp an toàn nút nhấn (đế + nắp)', ['GS EPL - 45'], 0.8],
  ['sga-pb-cover', 'switch-gas-air', 'Push button & emergency stop cover', 'Nắp nút nhấn & nút dừng khẩn', ['GS EPL - 45'], 0.8],
  ['sga-wall-switch', 'switch-gas-air', 'Wall switch lockout', 'Khóa công tắc tường', ['GS CBL-WS-01'], 1],
  ['sga-pneumatic', 'switch-gas-air', 'Pneumatic quick-disconnect lockout', 'Khóa đầu nối khí nén nhanh', ['GS CLO-1E'], 1],
  ['sga-gas-cap', 'switch-gas-air', 'Gas cylinder lockout cap', 'Nắp khóa bình khí', ['GS CLO-1E'], 1.6],
  ['sga-regulator', 'switch-gas-air', 'Air line regulator lockout', 'Khóa bộ điều áp đường khí', ['GS CLO-1E'], 1],
  ['sga-cylinder', 'switch-gas-air', 'Cylinder lockout', 'Khóa bình / xi lanh', ['GS CLO-1E'], 1],
  // Fuse & terminal
  ['fus-lockout', 'fuse-terminal', 'Fuse lockout device', 'Khóa cầu chì', ['GS CBL-SP-01'], 0.8],
  ['fus-blockout', 'fuse-terminal', 'Fuse blockout device', 'Chặn cầu chì', ['GS CBL-SP-01'], 0.8],
  ['fus-universal', 'fuse-terminal', 'Universal fuse lockout', 'Khóa cầu chì vạn năng', ['GS CBL-SP-01'], 1.2],
  ['fus-block', 'fuse-terminal', 'Fuse & terminal block lockout', 'Khóa khối cầu chì & đầu nối', ['GS CBL-SP-01'], 0.6],
  // Plug & vehicle
  ['plg-forklift', 'plug-vehicle', 'Forklift battery connector lockout', 'Khóa đầu nối ắc quy xe nâng', ['GS CBL-MFU'], 1.6],
  ['plg-ev', 'plug-vehicle', 'EV charging lockout', 'Khóa cổng / đầu sạc xe điện', ['GS CBL-MFU'], 1.6],
  ['plg-gladhand', 'plug-vehicle', 'Trailer air line (glad hand) lockout', 'Khóa đầu nối hơi rơ-moóc', ['GS CBL-MFU'], 1.2],
  ['plg-steering', 'plug-vehicle', 'Steering wheel safety cover', 'Nắp bảo vệ vô lăng', ['GS CBL-MFU'], 1.2],
  ['plg-batterycable', 'plug-vehicle', 'Battery cable lockout', 'Khóa dây cáp ắc quy', ['GS CBL-MFU'], 1.2],
  ['plg-iec', 'plug-vehicle', 'Detachable IEC plug lockout', 'Khóa phích cắm IEC tháo rời', ['GS EPL-PCL'], 1],
  ['plg-heavy', 'plug-vehicle', 'Heavy-duty plug lockout', 'Khóa phích cắm công nghiệp nặng', ['GS EPL-PCL'], 1.4],
  ['plg-electrical', 'plug-vehicle', 'Electrical plug lockout', 'Khóa phích cắm điện', ['GS EPL-PCL'], 1],
  ['plg-3in1', 'plug-vehicle', '3-in-1 plug lockout', 'Khóa phích cắm 3 trong 1', ['GS EPL-PCL'], 1.2],
  ['plg-elec-pneu', 'plug-vehicle', 'Electrical / pneumatic plug lockout', 'Khóa phích cắm điện / khí nén', ['GS EPL-PCL'], 1.1],
  ['plg-pinsleeve', 'plug-vehicle', 'Pin & sleeve plug / socket lockout', 'Khóa phích / ổ cắm công nghiệp (pin & sleeve)', ['GS EPL-PCL'], 1.1],
  ['plg-powercord', 'plug-vehicle', 'Power cord lockout', 'Khóa dây nguồn', ['GS EPL-PCL'], 1],
  // Confined space
  ['csp-cover-elastic', 'confined-space', 'Confined space cover, elastic', 'Nắp không gian hạn chế, loại đàn hồi', ['GS EPL-HL-1'], 1.8],
  ['csp-cover-magnetic', 'confined-space', 'Confined space cover, magnetic', 'Nắp không gian hạn chế, loại nam châm', ['GS EPL-HL-1'], 2.2],
  ['csp-sign', 'confined-space', 'Confined space manhole sign', 'Biển báo nắp hố người chui', ['GS EPL-HL-1'], 1.2],
  // Tags
  ['tag-standard', 'lockout-tags', 'Standard lockout tags (25 pack)', 'Thẻ lockout tiêu chuẩn (gói 25)', TAG, 1.7],
  ['tag-handyman', 'lockout-tags', 'Standard lockout tags (10 pack)', 'Thẻ lockout tiêu chuẩn (gói 10)', TAG, 1],
  ['tag-custom', 'lockout-tags', 'Customised lockout tags', 'Thẻ lockout in theo yêu cầu', ['GS C-TAGS'], 1],
  ['tag-hasp', 'lockout-tags', 'Hasp tag', 'Thẻ treo móc khóa', ['GS LH-T-A27'], 1],
  ['tag-energy', 'lockout-tags', 'Energy source tags', 'Thẻ nhận diện nguồn năng lượng', TAG, 0.8],
  ['tag-photo', 'lockout-tags', 'Photo lockout tags', 'Thẻ lockout có ảnh', TAG, 1.6],
  ['tag-padlock', 'lockout-tags', 'Padlock tags', 'Thẻ treo khóa', TAG, 0.6],
  ['tag-mini', 'lockout-tags', 'Mini safety tags & fasteners', 'Thẻ mini & dây rút', TAG, 0.6],
  ['tag-twopart', 'lockout-tags', 'Two-part perforated tags', 'Thẻ hai phần có đường xé', TAG, 1.6],
  ['tag-legend', 'lockout-tags', 'Custom-legend lockout tags', 'Thẻ lockout theo nội dung có sẵn', TAG, 1.4],
  ['tag-specialty', 'lockout-tags', 'Specialty lockout tags & ties', 'Thẻ lockout đặc biệt & dây rút', TAG, 1.6],
];

export const CONCEPTS = RAW.map(([id, category_id, en, vi, analog, factor]) => ({ id, category_id, en, vi, analog, factor }));
export const CONCEPT_BY_ID = new Map(CONCEPTS.map(concept => [concept.id, concept]));
export const CATEGORY_CODE = new Map(CATEGORIES.map(([id, , , code]) => [id, code]));
