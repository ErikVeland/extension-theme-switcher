# Theme Switcher Extension

A Vortex extension that provides a settings interface for switching and customizing UI themes.

## Features

- **Theme Selection**: Switch between available UI themes (Classic, Compact, Contrast, macOS Tahoe)
- **Color Customization**: Customize theme colors using a native color picker
- **Live Preview**: See theme changes applied in real-time
- **Theme Management**: Manage and organize custom theme configurations

## Recent Changes

### Version 0.0.2

#### Fixed
- **Dependency Resolution**: Removed `react-color` dependency to resolve build issues
- **Native Color Picker**: Replaced `ChromePicker` component with native HTML `<input type="color">` element
- **Build System**: Fixed macOS compatibility issues with `rsync` command in build process
- **Cross-platform Support**: Improved build script compatibility across different operating systems

#### Technical Improvements
- Simplified color picker implementation using browser-native controls
- Reduced bundle size by eliminating external color picker dependency
- Enhanced build reliability with improved `rsync` command handling
- Better error handling in theme color updates

## Installation

This extension is bundled with Vortex and does not require separate installation.

## Usage

1. Navigate to Settings → Interface → Themes
2. Select your preferred theme from the dropdown
3. Customize colors using the color picker controls
4. Changes are applied automatically

## Development

### Building

```bash
yarn run build
```

This will:
1. Compile TypeScript sources
2. Copy required libraries
3. Compile SCSS themes
4. Copy theme files
5. Deploy to the bundled plugins directory

### Dependencies

- TypeScript for source compilation
- Sass for theme compilation
- Font Scanner for font management
- Native browser APIs for color picking

## License

See LICENSE.md for license information.