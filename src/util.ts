import * as path from 'path';
import { log, util } from 'vortex-api';

export function themesPath(): string {
  return path.join(util.getVortexPath('userData'), 'themes');
}

interface IFont {
  family: string;
}

const DEFAULT_FONTS = [
  'Inter',
  'Roboto',
  'Montserrat',
  'BebasNeue',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia'
];

const getAvailableFontImpl = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fontScanner = require('font-scanner');
    return fontScanner.getAvailableFonts()
      .then((fonts: IFont[]) => Array.from(new Set<string>([
        ...DEFAULT_FONTS,
        ...(fonts || []).map(font => font.family).sort(),
      ])));
  } catch (err) {
    log('warn', 'font-scanner not available, using default fonts', err);
    return Promise.resolve(DEFAULT_FONTS);
  }
};

const getAvailableFonts: () => Promise<string[]> =
  util.makeRemoteCall('get-available-fonts', getAvailableFontImpl);

export { getAvailableFonts };
