/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  COLOR THEMES — swappable palettes for the whole invitation.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every theme overrides the same set of CSS custom properties that the design
 *  tokens in `index.css` expose. Because Tailwind v4 utilities reference those
 *  variables via `var(--color-*)`, setting them on <html> at runtime re-themes
 *  the entire page instantly — no reload, no rebuild.
 *
 *  Roles:
 *    navy*   → primary / dark text colour family
 *    gold*   → accent (buttons, highlights, shimmer)
 *    rose*   → soft romantic accent (hearts, blossoms)
 *    sky*    → hero + section light backgrounds
 *    neutral → ivory / cream page surfaces
 *    aura    → the three ambient background glows on <body>
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface Palette {
  /** navy, navy-700, navy-600, navy-500, navy-400 */
  navy: [string, string, string, string, string]
  /** gold, gold-light, gold-dark */
  gold: [string, string, string]
  /** rose, rosegold */
  rose: [string, string]
  /** sky, sky-soft */
  sky: [string, string]
  /** ivory, ivory-deep, cream, beige */
  neutral: [string, string, string, string]
  /** three ambient background glows */
  aura: [string, string, string]
}

export interface Theme {
  id: string
  /** Vietnamese label shown in the picker. */
  label: string
  /** Short descriptor. */
  note: string
  /** [dark, accent, light] preview swatch. */
  swatch: [string, string, string]
  /** CSS custom properties applied to <html>. */
  vars: Record<string, string>
}

function buildVars(p: Palette): Record<string, string> {
  return {
    '--color-navy': p.navy[0],
    '--color-navy-700': p.navy[1],
    '--color-navy-600': p.navy[2],
    '--color-navy-500': p.navy[3],
    '--color-navy-400': p.navy[4],
    '--color-gold': p.gold[0],
    '--color-gold-light': p.gold[1],
    '--color-gold-dark': p.gold[2],
    '--color-rose': p.rose[0],
    '--color-rosegold': p.rose[1],
    '--color-sky': p.sky[0],
    '--color-sky-soft': p.sky[1],
    '--color-ivory': p.neutral[0],
    '--color-ivory-deep': p.neutral[1],
    '--color-cream': p.neutral[2],
    '--color-beige': p.neutral[3],
    '--bg-aura-1': p.aura[0],
    '--bg-aura-2': p.aura[1],
    '--bg-aura-3': p.aura[2],
  }
}

function theme(
  id: string,
  label: string,
  note: string,
  p: Palette,
): Theme {
  return {
    id,
    label,
    note,
    swatch: [p.navy[0], p.gold[0], p.sky[1]],
    vars: buildVars(p),
  }
}

export const themes: Theme[] = [
  theme('classic-navy', 'Navy & Champagne', 'Bộ màu cưới cổ điển', {
    navy: ['#1B2A4A', '#2C3E66', '#4A5C80', '#5C6D8A', '#7A8BA8'],
    gold: ['#C8A45C', '#E8D5A0', '#A6843A'],
    rose: ['#E8B4B8', '#D4A87C'],
    sky: ['#C4D8E8', '#E8F0F6'],
    neutral: ['#FDFCFA', '#F5F0EC', '#FFF9F5', '#EDE6E0'],
    aura: ['#E8F4FD', '#FFF5E8', '#F0E8D8'],
  }),
  theme('rose-blush', 'Hồng phấn', 'Ngọt ngào & lãng mạn', {
    navy: ['#6B3A47', '#834A58', '#A0697A', '#B67F8F', '#CB9BA8'],
    gold: ['#D98A94', '#F1C3C9', '#B85E6C'],
    rose: ['#F3C6CE', '#E0A9A0'],
    sky: ['#F3D9DE', '#FBEEF1'],
    neutral: ['#FFFCFC', '#F8EFF0', '#FFF6F7', '#F0E4E5'],
    aura: ['#FDE8EE', '#FFF0E8', '#F6E4EC'],
  }),
  theme('emerald-gold', 'Ngọc lục bảo', 'Sang trọng & quyền quý', {
    navy: ['#12463A', '#1B5A4A', '#2E7362', '#4A8C7A', '#6FA898'],
    gold: ['#C9A227', '#E8D48A', '#A6841C'],
    rose: ['#E8C9A0', '#CBB07A'],
    sky: ['#C6E0D5', '#E6F2EC'],
    neutral: ['#FBFDFB', '#EEF4F0', '#F6FBF8', '#E2ECE6'],
    aura: ['#E3F3EA', '#FFF6E0', '#E6F0E2'],
  }),
  theme('burgundy-wine', 'Rượu vang', 'Nồng nàn & ấm áp', {
    navy: ['#5E1F2D', '#7A2A3B', '#9A4A5A', '#B06876', '#C88A96'],
    gold: ['#C6A15B', '#E6CE9A', '#A6813C'],
    rose: ['#E8BCC0', '#D9A088'],
    sky: ['#E4C9CE', '#F7EBED'],
    neutral: ['#FFFCFC', '#F6EEEF', '#FFF7F6', '#EFE2E3'],
    aura: ['#FBE6EA', '#FFF3E4', '#F3E2E4'],
  }),
  theme('dusty-blue', 'Xanh khói', 'Nhẹ nhàng & hiện đại', {
    navy: ['#33475D', '#455A70', '#607790', '#7A90A8', '#9AACBF'],
    gold: ['#C08560', '#E3C0A8', '#9E6A48'],
    rose: ['#DCC3C0', '#C79E8E'],
    sky: ['#C6D6E4', '#EAF1F7'],
    neutral: ['#FCFDFE', '#EEF1F5', '#F7FAFC', '#E3E9EF'],
    aura: ['#E6F0F9', '#FBF0E8', '#E9EEF4'],
  }),
  theme('terracotta', 'Đất nung', 'Ấm nồng như hoàng hôn', {
    navy: ['#7A3B2A', '#964B36', '#B0654E', '#C4826D', '#D6A18F'],
    gold: ['#E0925B', '#F4C79E', '#C06E3A'],
    rose: ['#F1C7B4', '#E0A886'],
    sky: ['#F0D3C2', '#FBEEE4'],
    neutral: ['#FFFDFB', '#F6EDE6', '#FFF6EF', '#EFE2D8'],
    aura: ['#FDE7D8', '#FFF2E2', '#F7E3D6'],
  }),
  theme('lavender', 'Tím lavender', 'Mộng mơ & dịu dàng', {
    navy: ['#4A3B6B', '#5C4B82', '#77659E', '#9080B4', '#AA9DC9'],
    gold: ['#C9A94E', '#E8D49A', '#A6883A'],
    rose: ['#E0C6E8', '#C9A9D4'],
    sky: ['#D6CBEC', '#F1ECF9'],
    neutral: ['#FDFCFF', '#F1EEF6', '#F9F6FD', '#E6E0EF'],
    aura: ['#EEE6FB', '#FFF6E4', '#EDE6F6'],
  }),
  theme('midnight-gold', 'Huyền & Vàng', 'Tối giản & đẳng cấp', {
    navy: ['#20202A', '#33333F', '#4D4D5A', '#6B6B78', '#8C8C99'],
    gold: ['#C8A24B', '#E6D194', '#A6843A'],
    rose: ['#E2D3C0', '#CBB79A'],
    sky: ['#D8DAE0', '#EFF0F3'],
    neutral: ['#FDFDFC', '#F1F1EF', '#FAFAF8', '#E6E6E2'],
    aura: ['#EDEEF2', '#FBF6E8', '#EEEDEA'],
  }),
  // ── Romantic additions ──────────────────────────────────────────────
  theme('blush-champagne', 'Phấn & Sâm banh', 'Lãng mạn tinh khôi', {
    navy: ['#5A3B45', '#704A58', '#8E6373', '#A97F8E', '#C29CA9'],
    gold: ['#D6A85E', '#F0D6A2', '#B4863C'],
    rose: ['#F2C4CE', '#E3AC9E'],
    sky: ['#F4DBE0', '#FCEFF2'],
    neutral: ['#FFFCFC', '#F7EEEF', '#FFF7F6', '#F0E5E4'],
    aura: ['#FCE6EC', '#FFF2E6', '#F6E6EA'],
  }),
  theme('sakura', 'Hoa anh đào', 'Dịu dàng như mùa xuân', {
    navy: ['#6B3A50', '#82475F', '#9E6278', '#B67E90', '#CD9BAB'],
    gold: ['#E08CA8', '#F5C8D8', '#C25E82'],
    rose: ['#F7C9D8', '#E9A9B8'],
    sky: ['#F6D7E1', '#FCEEF3'],
    neutral: ['#FFFCFD', '#F8EEF2', '#FFF6F9', '#F1E4EA'],
    aura: ['#FDE4EE', '#FFEFF4', '#F8E2EC'],
  }),
  theme('peach-coral', 'Đào & San hô', 'Ngọt ngào rực rỡ', {
    navy: ['#7A3B3A', '#93494A', '#B06463', '#C4827F', '#D6A19E'],
    gold: ['#E89B5E', '#F7CBA0', '#C6753C'],
    rose: ['#F6C2B4', '#E9A48E'],
    sky: ['#F7D2C6', '#FCEDE6'],
    neutral: ['#FFFDFB', '#F7EEE9', '#FFF6F1', '#F0E3DB'],
    aura: ['#FDE3D6', '#FFF0E4', '#F9E4DA'],
  }),
  theme('sage-ivory', 'Xanh sage', 'Thanh lịch tự nhiên', {
    navy: ['#3C4A3A', '#4B5B48', '#667661', '#84937E', '#A3B09D'],
    gold: ['#C6A85A', '#E7D49B', '#A5883A'],
    rose: ['#D9C4A8', '#C7AE86'],
    sky: ['#CFDCC6', '#EDF2E7'],
    neutral: ['#FCFDFB', '#EFF3EC', '#F7FBF3', '#E4EADE'],
    aura: ['#E7F0DE', '#FBF6E2', '#E9EFE0'],
  }),
  theme('sunset-glow', 'Hoàng hôn', 'Ấm áp & mộng mơ', {
    navy: ['#6E2F3F', '#87394D', '#A65468', '#BE7285', '#D293A2'],
    gold: ['#E79457', '#F6C79A', '#C56C34'],
    rose: ['#F3B7A6', '#E39A84'],
    sky: ['#F5CDBE', '#FCEAE0'],
    neutral: ['#FFFCFA', '#F7ECE6', '#FFF4EE', '#F0E1D8'],
    aura: ['#FDD9C8', '#FFEBDA', '#F8DAD0'],
  }),
  theme('ocean-pearl', 'Biển ngọc', 'Trong trẻo & sâu lắng', {
    navy: ['#123A4A', '#1B4C5E', '#2E6B7E', '#4A8799', '#6FA4B4'],
    gold: ['#CBB06A', '#E9DBA8', '#A98C3F'],
    rose: ['#DDC9B8', '#C4AC94'],
    sky: ['#C2DCE2', '#E6F2F4'],
    neutral: ['#FBFDFD', '#ECF3F4', '#F5FAFB', '#E0EBEC'],
    aura: ['#E0F1F3', '#FBF6E6', '#E4EFEF'],
  }),
  theme('plum-rose', 'Mận chín', 'Quyến rũ & sang trọng', {
    navy: ['#4A2540', '#5D3151', '#7A4A6C', '#94688A', '#AF89A6'],
    gold: ['#CBA25C', '#EBD59F', '#A9853B'],
    rose: ['#E7BDD4', '#D19FB4'],
    sky: ['#E0C9E0', '#F4ECF4'],
    neutral: ['#FFFCFE', '#F4EEF3', '#FBF5FA', '#EBE0E9'],
    aura: ['#F3E1F0', '#FFF3E6', '#F0E2EE'],
  }),
  theme('mocha-cream', 'Mocha kem', 'Ấm êm & mộc mạc', {
    navy: ['#4A382D', '#5C4738', '#7A5F4C', '#977C66', '#B39A84'],
    gold: ['#CBA268', '#EAD3A4', '#A98543'],
    rose: ['#E3C6B4', '#CFAD94'],
    sky: ['#E0D3C4', '#F3ECE2'],
    neutral: ['#FFFDFA', '#F4EEE6', '#FBF6EF', '#EBE0D4'],
    aura: ['#F3E6D6', '#FFF4E4', '#F1E5D6'],
  }),
  // ── Premium additions ───────────────────────────────────────────────
  theme('golden-hour', 'Giờ vàng', 'Rực rỡ trước hoàng hôn', {
    navy: ['#5F3A17', '#75481F', '#8F5E2E', '#A87844', '#BF9260'],
    gold: ['#E3A93E', '#F6D488', '#B97F1F'],
    rose: ['#F3C89A', '#E0AC72'],
    sky: ['#F6DDB0', '#FBEFD8'],
    neutral: ['#FFFDF8', '#F8EFDE', '#FFF8EA', '#F1E4CB'],
    aura: ['#FBE8C4', '#FFF3D9', '#F7E6C6'],
  }),
  theme('desert-rose', 'Hồng sa mạc', 'Tinh tế & thanh nhã', {
    navy: ['#5C4048', '#71505A', '#8C6A74', '#A5848E', '#BD9FA8'],
    gold: ['#C99A7B', '#E8C7B0', '#A6755A'],
    rose: ['#E3B8B0', '#D09C90'],
    sky: ['#E8D0CC', '#F7ECEA'],
    neutral: ['#FEFCFB', '#F5EDEB', '#FBF4F2', '#EDE1DE'],
    aura: ['#F6E2DE', '#FCEFE6', '#F2E2DE'],
  }),
  theme('midnight-galaxy', 'Dạ hội', 'Huyền bí & lộng lẫy', {
    navy: ['#232042', '#332F58', '#4C4875', '#6A6692', '#8B87AE'],
    gold: ['#A48BD4', '#D3C4F0', '#7E63B4'],
    rose: ['#D4BCE8', '#B49CD4'],
    sky: ['#D0CCE8', '#EEECF8'],
    neutral: ['#FDFCFF', '#F2F0F8', '#F9F7FD', '#E7E4F0'],
    aura: ['#E9E3F9', '#F6EEFB', '#E7E3F3'],
  }),
  theme('arctic-frost', 'Sương băng', 'Trong trẻo & thanh khiết', {
    navy: ['#2E4A5C', '#3E5E72', '#587A90', '#7896AA', '#9AB4C4'],
    gold: ['#7FA8BE', '#C2DAE6', '#5A8095'],
    rose: ['#E2D4DC', '#C4B2BE'],
    sky: ['#CFE2EC', '#EBF4F8'],
    neutral: ['#FCFEFF', '#EFF4F7', '#F7FBFD', '#E4EBF0'],
    aura: ['#E2F0F7', '#F4F8FB', '#E6EEF3'],
  }),
  theme('botanical-peony', 'Mẫu đơn', 'Tươi mới & rạng rỡ', {
    navy: ['#2E4A38', '#3C5E48', '#567860', '#74927E', '#94AE9E'],
    gold: ['#C9A85E', '#E8D5A2', '#A6873C'],
    rose: ['#F2B8C6', '#E094AA'],
    sky: ['#D6E8DA', '#EEF7F0'],
    neutral: ['#FCFEFC', '#F0F6F1', '#F8FCF8', '#E5EFE7'],
    aura: ['#E4F3E6', '#FDEDF2', '#E8F1E8'],
  }),
  theme('silk-pearl', 'Lụa ngọc trai', 'Tối giản & tinh khôi', {
    navy: ['#3E3A36', '#524D48', '#6E6862', '#8A837C', '#A69F98'],
    gold: ['#BFA37E', '#E2CDAF', '#987953'],
    rose: ['#E4D2C8', '#CDB6A8'],
    sky: ['#E2DDD6', '#F4F1EC'],
    neutral: ['#FEFDFB', '#F4F1EC', '#FAF8F4', '#EAE5DD'],
    aura: ['#F1ECE3', '#FBF5EC', '#EFEAE2'],
  }),
  // ── Romantic collection II ──────────────────────────────────────────
  theme('rose-quartz', 'Thạch anh hồng', 'Dịu dàng & thủy chung', {
    navy: ['#4E3D4D', '#63505F', '#7E6A7A', '#998597', '#B3A2B1'],
    gold: ['#D9A0A8', '#F2CBD1', '#B77680'],
    rose: ['#F4C6CE', '#E2AAB6'],
    sky: ['#DCE4F0', '#F0F4FA'],
    neutral: ['#FEFCFD', '#F6EFF2', '#FCF5F8', '#EEE2E8'],
    aura: ['#F9E3EA', '#EDF1FA', '#F5E4EC'],
  }),
  theme('moonlight', 'Ánh trăng', 'Huyền ảo đêm thơ', {
    navy: ['#2F3550', '#3F4666', '#5A6284', '#7880A0', '#989FBC'],
    gold: ['#AEB8D8', '#DCE2F2', '#8490B8'],
    rose: ['#D8D2E8', '#B9B2D0'],
    sky: ['#CBD2E8', '#EBEEF8'],
    neutral: ['#FCFCFE', '#F0F1F7', '#F8F9FC', '#E5E7F0'],
    aura: ['#E4E8F6', '#F4F0FA', '#E6E6F2'],
  }),
  theme('lotus-pink', 'Sen hồng', 'Thuần Việt & thanh tao', {
    navy: ['#2F4A40', '#3D5E52', '#57786A', '#759286', '#95AEA4'],
    gold: ['#D08FA6', '#EFC5D2', '#B06680'],
    rose: ['#F3BFCE', '#E39FB4'],
    sky: ['#D9E8DE', '#EFF7F1'],
    neutral: ['#FCFEFC', '#F1F6F1', '#F9FCF8', '#E6EFE7'],
    aura: ['#E7F3E8', '#FBE7EE', '#EAF1E8'],
  }),
  theme('orchid-mist', 'Lan tím', 'Kiêu sa & mộng ảo', {
    navy: ['#4B3355', '#5E4169', '#795A85', '#94769F', '#AF93B9'],
    gold: ['#B98CC9', '#E0C6EA', '#9463A8'],
    rose: ['#E5C1E2', '#CBA3C8'],
    sky: ['#E0D3EA', '#F3EDF8'],
    neutral: ['#FDFCFE', '#F4F0F6', '#FAF7FC', '#EAE3EE'],
    aura: ['#F0E3F6', '#FBF0F6', '#EDE3F2'],
  }),
  theme('autumn-hanoi', 'Thu Hà Nội', 'Lá thu & nắng mật', {
    navy: ['#67302A', '#7E3C33', '#9A5749', '#B37363', '#C79184'],
    gold: ['#D98E4E', '#F1C695', '#B56A2E'],
    rose: ['#EFBFA4', '#DCA184'],
    sky: ['#F0DAC2', '#F9EFDF'],
    neutral: ['#FFFDF9', '#F7EFE3', '#FDF6EC', '#EFE3D2'],
    aura: ['#F9E7CE', '#FDF0DC', '#F4E3CE'],
  }),
  // ── Luxury collection ───────────────────────────────────────────────
  theme('royal-sapphire', 'Sapphire hoàng gia', 'Xanh thẳm & bạch kim', {
    navy: ['#16264E', '#1F3364', '#35497E', '#54679A', '#7A8BB4'],
    gold: ['#A8BCD9', '#DCE5F3', '#5E7699'],
    rose: ['#C9D4E8', '#A9B8D4'],
    sky: ['#CBD9EC', '#EAF1F8'],
    neutral: ['#FCFDFE', '#EFF3F8', '#F7FAFC', '#E3EAF2'],
    aura: ['#E3ECF8', '#F2F6FB', '#E7EDF5'],
  }),
  theme('velvet-noir', 'Nhung đêm', 'Đen nhung & hồng sâm banh', {
    navy: ['#2A2226', '#3C3138', '#57484F', '#746168', '#948086'],
    gold: ['#D4A5A0', '#EFD0CC', '#A97570'],
    rose: ['#E8C4C0', '#D0A29C'],
    sky: ['#E4D8DA', '#F4EEEF'],
    neutral: ['#FDFCFC', '#F3EFF0', '#FAF7F7', '#EAE3E4'],
    aura: ['#F2E6E6', '#FAF0EE', '#EFE5E5'],
  }),
  theme('imperial-jade', 'Ngọc hoàng gia', 'Lục bảo thẫm & vàng cổ', {
    navy: ['#0F3B33', '#175046', '#2A6B5E', '#478578', '#6FA093'],
    gold: ['#C9A55A', '#E9D6A0', '#A28038'],
    rose: ['#D9C8A8', '#C0A987'],
    sky: ['#C8DED6', '#E7F2ED'],
    neutral: ['#FAFDFB', '#EDF4F0', '#F5FAF7', '#E0EBE5'],
    aura: ['#DFEFE7', '#F7EFDB', '#E2EDE5'],
  }),
  theme('antique-brass', 'Đồng cổ', 'Ô liu trầm & đồng thau', {
    navy: ['#3A3A2E', '#4C4C3C', '#686852', '#85856C', '#A3A38A'],
    gold: ['#B8985A', '#DCC79A', '#8F7238'],
    rose: ['#D8C8B0', '#BFAA8C'],
    sky: ['#DEDCCC', '#F1F0E6'],
    neutral: ['#FDFDFA', '#F2F1EA', '#F9F8F2', '#E8E6DA'],
    aura: ['#EFEDDD', '#F9F3E3', '#ECEADC'],
  }),
  theme('platinum-blush', 'Hồng bạch kim', 'Nude & ánh kim lạnh', {
    navy: ['#4A4046', '#5E5259', '#7A6C74', '#968890', '#B2A6AD'],
    gold: ['#C9A6B2', '#E9D2DB', '#A17A8A'],
    rose: ['#EBCAD4', '#D4ACBA'],
    sky: ['#E6DEE4', '#F5F1F4'],
    neutral: ['#FEFDFE', '#F5F1F3', '#FBF8FA', '#ECE6E9'],
    aura: ['#F4E8EE', '#F8F1F4', '#EFE7EC'],
  }),
  theme('black-orchid', 'Lan đêm', 'Huyền bí & quyến rũ', {
    navy: ['#2E2438', '#40334C', '#5B4C6A', '#786A88', '#9789A8'],
    gold: ['#B694D0', '#DEC9EE', '#8A64A8'],
    rose: ['#D9BEE4', '#BC9CCC'],
    sky: ['#DCD2E6', '#F0EBF6'],
    neutral: ['#FDFCFE', '#F2EFF6', '#F9F7FC', '#E8E3F0'],
    aura: ['#EDE4F6', '#F6F0FA', '#EAE4F2'],
  }),
  theme('first-love', 'Tình đầu', 'Trong veo & e ấp', {
    navy: ['#6B4A3E', '#82594B', '#9E7362', '#B78E7D', '#CCA99A'],
    gold: ['#E8A87C', '#F8D3B8', '#C67F52'],
    rose: ['#F6C8BB', '#E7AC9B'],
    sky: ['#FADFD2', '#FDF1EA'],
    neutral: ['#FFFDFC', '#F9F0EA', '#FFF7F2', '#F2E5DC'],
    aura: ['#FCE4D8', '#FFF1E6', '#F8E5DA'],
  }),
]

export const defaultThemeId = themes[0].id

const STORAGE_KEY = 'wedding-theme'

export function getSavedThemeId(): string {
  if (typeof window === 'undefined') return defaultThemeId
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && themes.some((t) => t.id === saved)) return saved
  } catch {
    /* ignore storage errors */
  }
  return defaultThemeId
}

export function saveThemeId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    /* ignore storage errors */
  }
}

/** Apply a theme's CSS variables to <html>. Safe to call before React mounts. */
export function applyThemeById(id: string): void {
  if (typeof document === 'undefined') return
  const t = themes.find((x) => x.id === id) ?? themes[0]
  const root = document.documentElement
  for (const [key, value] of Object.entries(t.vars)) {
    root.style.setProperty(key, value)
  }
  root.dataset.theme = t.id
}
