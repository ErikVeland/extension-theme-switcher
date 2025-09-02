import { types, util, log } from 'vortex-api';

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
    [actions.selectTheme as any]: (state, payload) => {
      log('debug', 'Theme reducer: selectTheme action dispatched', {
        previousTheme: state.currentTheme,
        newTheme: payload,
        timestamp: new Date().toISOString()
      });
      
      const newState = util.setSafe(state, ['currentTheme'], payload);
      
      log('debug', 'Theme reducer: state updated', {
        oldState: state,
        newState,
        currentTheme: newState.currentTheme
      });
      
      return newState;
    },
  },
  defaults: {
    currentTheme: getDefaultTheme(),
  },
};

log('debug', 'Theme reducer initialized with defaults', {
  platform: process.platform,
  defaultTheme: process.platform === 'darwin' ? 'macos-tahoe' : '__default'
});

export default settingsReducer;
