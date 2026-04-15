// Unified entry for theme factories.
// The classic theme still lives at `src/theme.js` and powers the live site —
// we just re-export it here so consumers can import from `src/theme`.

import getTheme from '../theme.js';
import getSurfTheme from './surfTheme';

export { getTheme, getSurfTheme };
export * as surfTokens from './tokens';
export default getTheme;
