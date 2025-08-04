import { types, util } from 'vortex-api';

import * as actions from './actions';

// Set default theme based on platform
const getDefaultTheme = () => {
  // Use macOS Tahoe theme as default on Mac systems
  if (process.platform === 'darwin') {
    return 'macos-tahoe';
  }
  // Use default theme on other platforms
  return '__default';
};

const settingsReducer: types.IReducerSpec = {
  reducers: {
    [actions.selectTheme as any]: (state, payload) =>
      util.setSafe(state, ['currentTheme'], payload),
  },
  defaults: {
    currentTheme: getDefaultTheme(),
  },
};

export default settingsReducer;
