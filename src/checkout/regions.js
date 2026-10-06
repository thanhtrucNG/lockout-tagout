// First-level administrative units for countries whose City / Province field is a picked list.
// Vietnam: the 34 provincial-level units in force since 1 July 2025 (6 centrally-run cities + 28 provinces).
// US / CA / AU / MY codes are ISO 3166-2; Vietnam's 2025 units use stable lowercase slugs.
// Other countries have no list: City / Province stays free text.
const same = (code, name) => ({ code, name_en: name, name_vi: name });

const VN_CITIES = [
  ['ha-noi', 'Hanoi', 'Thành phố Hà Nội'],
  ['hue', 'Hue', 'Thành phố Huế'],
  ['hai-phong', 'Hai Phong', 'Thành phố Hải Phòng'],
  ['da-nang', 'Da Nang', 'Thành phố Đà Nẵng'],
  ['ho-chi-minh', 'Ho Chi Minh City', 'Thành phố Hồ Chí Minh'],
  ['can-tho', 'Can Tho', 'Thành phố Cần Thơ'],
];
const VN_PROVINCES = [
  ['tuyen-quang', 'Tuyen Quang', 'Tuyên Quang'], ['cao-bang', 'Cao Bang', 'Cao Bằng'],
  ['lai-chau', 'Lai Chau', 'Lai Châu'], ['lao-cai', 'Lao Cai', 'Lào Cai'],
  ['thai-nguyen', 'Thai Nguyen', 'Thái Nguyên'], ['dien-bien', 'Dien Bien', 'Điện Biên'],
  ['lang-son', 'Lang Son', 'Lạng Sơn'], ['son-la', 'Son La', 'Sơn La'],
  ['phu-tho', 'Phu Tho', 'Phú Thọ'], ['bac-ninh', 'Bac Ninh', 'Bắc Ninh'],
  ['quang-ninh', 'Quang Ninh', 'Quảng Ninh'], ['hung-yen', 'Hung Yen', 'Hưng Yên'],
  ['ninh-binh', 'Ninh Binh', 'Ninh Bình'], ['thanh-hoa', 'Thanh Hoa', 'Thanh Hóa'],
  ['nghe-an', 'Nghe An', 'Nghệ An'], ['ha-tinh', 'Ha Tinh', 'Hà Tĩnh'],
  ['quang-tri', 'Quang Tri', 'Quảng Trị'], ['quang-ngai', 'Quang Ngai', 'Quảng Ngãi'],
  ['gia-lai', 'Gia Lai', 'Gia Lai'], ['khanh-hoa', 'Khanh Hoa', 'Khánh Hòa'],
  ['lam-dong', 'Lam Dong', 'Lâm Đồng'], ['dak-lak', 'Dak Lak', 'Đắk Lắk'],
  ['dong-nai', 'Dong Nai', 'Đồng Nai'], ['tay-ninh', 'Tay Ninh', 'Tây Ninh'],
  ['vinh-long', 'Vinh Long', 'Vĩnh Long'], ['dong-thap', 'Dong Thap', 'Đồng Tháp'],
  ['ca-mau', 'Ca Mau', 'Cà Mau'], ['an-giang', 'An Giang', 'An Giang'],
];

const US = [
  ['US-AL', 'Alabama'], ['US-AK', 'Alaska'], ['US-AZ', 'Arizona'], ['US-AR', 'Arkansas'], ['US-CA', 'California'],
  ['US-CO', 'Colorado'], ['US-CT', 'Connecticut'], ['US-DE', 'Delaware'], ['US-DC', 'District of Columbia'], ['US-FL', 'Florida'],
  ['US-GA', 'Georgia'], ['US-HI', 'Hawaii'], ['US-ID', 'Idaho'], ['US-IL', 'Illinois'], ['US-IN', 'Indiana'],
  ['US-IA', 'Iowa'], ['US-KS', 'Kansas'], ['US-KY', 'Kentucky'], ['US-LA', 'Louisiana'], ['US-ME', 'Maine'],
  ['US-MD', 'Maryland'], ['US-MA', 'Massachusetts'], ['US-MI', 'Michigan'], ['US-MN', 'Minnesota'], ['US-MS', 'Mississippi'],
  ['US-MO', 'Missouri'], ['US-MT', 'Montana'], ['US-NE', 'Nebraska'], ['US-NV', 'Nevada'], ['US-NH', 'New Hampshire'],
  ['US-NJ', 'New Jersey'], ['US-NM', 'New Mexico'], ['US-NY', 'New York'], ['US-NC', 'North Carolina'], ['US-ND', 'North Dakota'],
  ['US-OH', 'Ohio'], ['US-OK', 'Oklahoma'], ['US-OR', 'Oregon'], ['US-PA', 'Pennsylvania'], ['US-RI', 'Rhode Island'],
  ['US-SC', 'South Carolina'], ['US-SD', 'South Dakota'], ['US-TN', 'Tennessee'], ['US-TX', 'Texas'], ['US-UT', 'Utah'],
  ['US-VT', 'Vermont'], ['US-VA', 'Virginia'], ['US-WA', 'Washington'], ['US-WV', 'West Virginia'], ['US-WI', 'Wisconsin'],
  ['US-WY', 'Wyoming'],
];
const CA = [
  ['CA-AB', 'Alberta'], ['CA-BC', 'British Columbia'], ['CA-MB', 'Manitoba'], ['CA-NB', 'New Brunswick'],
  ['CA-NL', 'Newfoundland and Labrador'], ['CA-NS', 'Nova Scotia'], ['CA-ON', 'Ontario'], ['CA-PE', 'Prince Edward Island'],
  ['CA-QC', 'Quebec'], ['CA-SK', 'Saskatchewan'], ['CA-NT', 'Northwest Territories'], ['CA-NU', 'Nunavut'], ['CA-YT', 'Yukon'],
];
const AU = [
  ['AU-ACT', 'Australian Capital Territory'], ['AU-NSW', 'New South Wales'], ['AU-NT', 'Northern Territory'], ['AU-QLD', 'Queensland'],
  ['AU-SA', 'South Australia'], ['AU-TAS', 'Tasmania'], ['AU-VIC', 'Victoria'], ['AU-WA', 'Western Australia'],
];
const MY = [
  ['MY-01', 'Johor'], ['MY-02', 'Kedah'], ['MY-03', 'Kelantan'], ['MY-04', 'Melaka'], ['MY-05', 'Negeri Sembilan'],
  ['MY-06', 'Pahang'], ['MY-07', 'Penang'], ['MY-08', 'Perak'], ['MY-09', 'Perlis'], ['MY-10', 'Selangor'],
  ['MY-11', 'Terengganu'], ['MY-12', 'Sabah'], ['MY-13', 'Sarawak'], ['MY-14', 'Kuala Lumpur'], ['MY-15', 'Labuan'],
  ['MY-16', 'Putrajaya'],
];

const vn = rows => rows.map(([code, en, vi]) => ({ code, name_en: en, name_vi: vi }));
export const regions = Object.freeze({
  VN: Object.freeze([...vn(VN_CITIES), ...vn(VN_PROVINCES)]),
  US: Object.freeze(US.map(([code, name]) => same(code, name))),
  CA: Object.freeze(CA.map(([code, name]) => same(code, name))),
  AU: Object.freeze(AU.map(([code, name]) => same(code, name))),
  MY: Object.freeze(MY.map(([code, name]) => same(code, name))),
});

const VN_CITY_CODES = new Set(VN_CITIES.map(([code]) => code));

/** Regions for a country, sorted for display in the given language (Vietnam: cities first). Empty array = free text. */
export function regionsFor(countryCode, language = 'en') {
  const list = regions[countryCode];
  if (!list) return [];
  const label = region => regionName(region, language);
  const sortKey = region => label(region).replace(/^Thành phố /, '');
  return [...list].sort((a, b) => {
    if (countryCode === 'VN') {
      const cityOrder = Number(VN_CITY_CODES.has(b.code)) - Number(VN_CITY_CODES.has(a.code));
      if (cityOrder) return cityOrder;
    }
    return sortKey(a).localeCompare(sortKey(b), language === 'vi' ? 'vi' : 'en');
  });
}
export const hasRegionList = countryCode => Boolean(regions[countryCode]);
export const regionByCode = (countryCode, code) => regions[countryCode]?.find(region => region.code === code) ?? null;
export const regionName = (region, language = 'en') => region ? region[language === 'vi' ? 'name_vi' : 'name_en'] : '';
