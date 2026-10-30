import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

/**
 * Fonts are bundled locally (public/fonts, from @fontsource, SIL Open Font License) so a
 * 4K render never depends on the network. loadFont() blocks rendering until each font is ready.
 */
const FILES: { family: string; file: string; weight: string; unicodeRange?: string }[] = [
  { family: 'Playfair Display', file: 'playfair-display-latin-600-normal.woff2', weight: '600' },
  { family: 'Playfair Display', file: 'playfair-display-latin-700-normal.woff2', weight: '700' },
  { family: 'Playfair Display', file: 'playfair-display-latin-800-normal.woff2', weight: '800' },
  { family: 'Anton', file: 'anton-latin-400-normal.woff2', weight: '400' },
  { family: 'Kalam', file: 'kalam-latin-400-normal.woff2', weight: '400' },
  { family: 'Kalam', file: 'kalam-latin-700-normal.woff2', weight: '700' },
  { family: 'Kalam', file: 'kalam-devanagari-400-normal.woff2', weight: '400', unicodeRange: 'U+0900-097F' },
  { family: 'Kalam', file: 'kalam-devanagari-700-normal.woff2', weight: '700', unicodeRange: 'U+0900-097F' },
  { family: 'Tiro Devanagari Hindi', file: 'tiro-devanagari-hindi-latin-400-normal.woff2', weight: '400' },
  {
    family: 'Tiro Devanagari Hindi',
    file: 'tiro-devanagari-hindi-devanagari-400-normal.woff2',
    weight: '400',
    unicodeRange: 'U+0900-097F',
  },
  { family: 'Rozha One', file: 'rozha-one-latin-400-normal.woff2', weight: '400' },
  { family: 'Rozha One', file: 'rozha-one-devanagari-400-normal.woff2', weight: '400', unicodeRange: 'U+0900-097F' },
  { family: 'Hind', file: 'hind-latin-700-normal.woff2', weight: '700' },
  { family: 'Nunito', file: 'nunito-latin-800-normal.woff2', weight: '800' },
  { family: 'Nunito', file: 'nunito-latin-900-normal.woff2', weight: '900' },
  { family: 'Poppins', file: 'poppins-latin-600-normal.woff2', weight: '600' },
  { family: 'Poppins', file: 'poppins-latin-700-normal.woff2', weight: '700' },
  { family: 'Ma Shan Zheng', file: 'ma-shan-zheng-horse-subset.woff2', weight: '400' },
  { family: 'Hind', file: 'hind-devanagari-700-normal.woff2', weight: '700', unicodeRange: 'U+0900-097F' },
];

export const loadFonts = () => {
  for (const f of FILES) {
    loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight, unicodeRange: f.unicodeRange });
  }
};
