import * as ops from './operations';
import settingsReducer from './reducers';
import SettingsTheme from './SettingsTheme';
import { getAvailableFonts, themesPath } from './util';
import * as path from 'path';
import { fs, log, types, util } from 'vortex-api';

function applyThemeSync(api: types.IExtensionApi, theme: string): void {
  log('debug', 'applyThemeSync called', { theme });
  
  if (theme === null) {
    log('debug', 'Clearing theme stylesheets');
    api.setStylesheet('variables', undefined);
    api.setStylesheet('details', undefined);
    api.setStylesheet('fonts', undefined);
    api.setStylesheet('style', undefined);
    return;
  }

  // For initial theme loading, use direct path construction
  // StyleManager will handle .scss file resolution and existence checks
  const themeDir = path.join(__dirname, 'themes', theme);
  
  log('debug', 'applyThemeSync setting theme paths', {
    theme,
    themeDir,
    variablesPath: path.join(themeDir, 'variables'),
    detailsPath: path.join(themeDir, 'details'),
    fontsPath: path.join(themeDir, 'fonts'),
    stylePath: path.join(themeDir, 'style')
  });

  // Set stylesheet paths - StyleManager will handle .scss resolution
  api.setStylesheet('variables', path.join(themeDir, 'variables'));
  api.setStylesheet('details', path.join(themeDir, 'details'));
  api.setStylesheet('fonts', path.join(themeDir, 'fonts'));
  api.setStylesheet('style', path.join(themeDir, 'style'));
  
  log('info', 'Theme stylesheets set synchronously', { theme, themeDir });
}

function applyTheme(api: types.IExtensionApi, theme: string, initial: boolean) {
  log('debug', 'applyTheme() called', {
    theme,
    initial,
    timestamp: new Date().toISOString()
  });
  
  if (!initial) {
    log('debug', 'Clearing existing stylesheets');
    api.clearStylesheet();
  }

  if (theme === null) {
    log('debug', 'Applying null theme - clearing all stylesheets');
    api.setStylesheet('variables', undefined);
    api.setStylesheet('details', undefined);
    api.setStylesheet('fonts', undefined);
    api.setStylesheet('style', undefined);
    return;
  }

  return util.readExtensibleDir('theme', path.join(__dirname, 'themes'), themesPath())
    .then(themes => {
      log('debug', 'Available themes found', {
        themesCount: themes.length,
        themesList: themes.map(t => path.basename(t)),
        requestedTheme: theme
      });
      
      const selected = themes.find(iter => path.basename(iter) === theme);
      if (selected === undefined) {
        log('warn', 'Requested theme not found', {
          requestedTheme: theme,
          availableThemes: themes.map(t => path.basename(t))
        });
        return Promise.resolve();
      }

      log('debug', 'Selected theme path', {
        theme,
        selectedPath: selected
      });

      // Set extensionless paths; StyleManager will resolve .scss or .css and ignore missing ones
      return Promise.resolve()
        .then(() => {
          log('debug', 'Loading variables stylesheet', { path: path.join(selected, 'variables') });
          api.setStylesheet('variables', path.join(selected, 'variables'));
        })
        .then(() => {
          log('debug', 'Loading details stylesheet', { path: path.join(selected, 'details') });
          api.setStylesheet('details', path.join(selected, 'details'));
        })
        .then(() => {
          log('debug', 'Loading fonts stylesheet', { path: path.join(selected, 'fonts') });
          api.setStylesheet('fonts', path.join(selected, 'fonts'));
        })
        .then(() => {
          log('debug', 'Loading style stylesheet', { path: path.join(selected, 'style') });
          api.setStylesheet('style', path.join(selected, 'style'));
        })
        .then(() => {
          log('debug', 'Theme stylesheets set, waiting for CSS injection verification');
          
          // Force a render to ensure CSS gets injected
          // This is critical for initial theme loading when StyleManager auto-refresh isn't enabled yet
          setTimeout(() => {
            const themeElement = document.getElementById('theme');
            const headElement = document.getElementsByTagName('head')[0];
            
            log('debug', 'CSS injection verification check', {
              themeElementExists: !!themeElement,
              themeElementContent: themeElement?.innerHTML?.substring(0, 200) || 'none',
              themeElementContentLength: themeElement?.innerHTML?.length || 0,
              totalHeadChildren: headElement?.children?.length || 0,
              headChildrenWithThemeId: Array.from(headElement?.children || []).filter(el => el.id === 'theme').length,
              timestamp: new Date().toISOString()
            });
            
            if (!themeElement || !themeElement.innerHTML) {
              log('warn', 'CSS injection verification FAILED - theme element missing or empty', {
                theme,
                selectedPath: selected,
                themeElementExists: !!themeElement,
                themeElementContent: themeElement?.innerHTML || 'none'
              });
            } else {
              log('info', 'CSS injection verification SUCCESS - theme element found with content', {
                theme,
                selectedPath: selected,
                contentLength: themeElement.innerHTML.length,
                contentPreview: themeElement.innerHTML.substring(0, 100)
              });
            }
          }, 500);
        })
        .then(() => {
          log('info', 'Theme applied successfully', { theme, selectedPath: selected });
        });
    });
}

function editStyle(api: types.IExtensionApi, themeName: string): Promise<void> {
  const stylePath = path.join(ops.themePath(themeName), 'style.scss');
  return fs.ensureFileAsync(stylePath)
    .then(() =>
      util.opn(stylePath)
        .catch(util.MissingInterpreter, (err) => {
          api.showDialog('error', 'No handler found', {
            text: 'You don\'t have an editor associated with scss files. '
              + 'You can fix this by opening the following file from your file explorer, '
              + 'pick your favorite text editor and when prompted, choose to always open '
              + 'that file type with that editor.',
            message: err.url,
          }, [
            { label: 'Close' },
          ]);
        })
        .catch(err => {
          log('error', 'failed to open', err);
        }));
}

function init(context: types.IExtensionContext) {
  context.registerReducer(['settings', 'interface'], settingsReducer);

  const onCloneTheme = (themeName: string, newName: string) =>
    ops.cloneTheme(context.api, themeName, newName);
  const onSelectTheme = (theme: string) => ops.selectTheme(context.api, theme);
  const saveTheme = (themeName: string, variables: { [name: string]: string }) =>
    ops.saveTheme(context.api, themeName, variables);
  const removeTheme = (themeName: string) => ops.removeTheme(context.api, themeName);
  const onEditStyle = (themeName: string) => editStyle(context.api, themeName);

  context.registerSettings('Theme', SettingsTheme, () => ({
    readThemes: ops.readThemes,
    onCloneTheme,
    onSelectTheme,
    readThemeVariables: ops.readThemeVariables,
    onSaveTheme: saveTheme,
    onRemoveTheme: removeTheme,
    locationToName: ops.themeName,
    nameToLocation: ops.themePath,
    isThemeCustom: ops.isThemeCustom,
    onEditStyle,
    getAvailableFonts,
  }));

  context.once(() => {
    log('debug', 'Theme-switcher extension context.once() callback');
    
    // Apply theme IMMEDIATELY in context.once() to ensure it loads before StyleManager's first render
    const store = context.api.store;
    const currentState = store.getState();
    const currentTheme = currentState.settings.interface.currentTheme;
    
    log('debug', 'Theme-switcher extension applying theme immediately in context.once()', {
      currentTheme,
      settingsInterface: currentState.settings.interface,
      hasStore: !!store,
      hasEvents: !!context.api.events
    });

    // Apply theme synchronously during initialization to beat StyleManager's first render
    if (currentTheme) {
      applyThemeSync(context.api, currentTheme);
    }

    context.api.events.on('select-theme', (selectedThemePath: string) => {
      log('debug', 'select-theme event received', {
        selectedThemePath,
        timestamp: new Date().toISOString()
      });
      applyTheme(context.api, selectedThemePath, false);
    });
    
    context.api.events.on('apply-theme', (themeName: string) => {
      log('debug', 'apply-theme event received', {
        themeName,
        timestamp: new Date().toISOString()
      });
      applyTheme(context.api, themeName, false);
    });

    // Keep the startup re-application as a backup safety net
    context.api.events.on('startup', () => {
      log('debug', 'Startup event received - re-applying theme as safety net', {
        currentTheme,
        timestamp: new Date().toISOString()
      });
      const state = context.api.store.getState();
      const activeTheme = state.settings.interface.currentTheme;
      if (activeTheme) {
        setTimeout(() => {
          log('debug', 'Re-applying theme after startup delay (safety net)', { theme: activeTheme });
          applyTheme(context.api, activeTheme, false);
        }, 500); // Reduced timeout since theme should already be applied
      }
    });
  });

  return true;
}

export default init;
