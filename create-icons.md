# Icon Creation Instructions

Since ImageMagick is not available, you'll need to create the extension icons manually. Here are the specifications:

## Icon Requirements

Create three PNG files with a lightning bolt theme:

1. **icon16.png** - 16x16 pixels
2. **icon48.png** - 48x48 pixels  
3. **icon128.png** - 128x128 pixels

## Design Specifications

- **Background**: Dark (#1a1a1a)
- **Lightning Bolt**: Purple gradient (#8b5cf6 to #a78bfa)
- **Style**: Modern, clean, minimal
- **Shape**: Rounded corners for larger icons

## Quick Methods

### Option 1: Online Tool
1. Go to [Canva](https://canva.com) or [Figma](https://figma.com)
2. Create square canvases: 16x16, 48x48, 128x128 pixels
3. Add dark background
4. Add purple lightning bolt symbol (⚡)
5. Export as PNG

### Option 2: Use System Tools
```bash
# On macOS with Preview
# 1. Take a screenshot of the ⚡ emoji
# 2. Open in Preview
# 3. Resize to required dimensions
# 4. Export as PNG
```

### Option 3: Simple SVG to PNG
Create an SVG file and convert using online tools:

```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="20" fill="#1a1a1a"/>
  <text x="64" y="90" font-family="Arial" font-size="80" fill="#8b5cf6" text-anchor="middle">⚡</text>
</svg>
```

## Temporary Solution

The extension will work without icons, but Chrome will show a default icon. For immediate testing, you can:

1. Comment out the icons section in `manifest.json`
2. Or use any existing PNG files and rename them

## After Creating Icons

Place the three PNG files in the extension root directory alongside `manifest.json`.

The extension is fully functional - icons are only for visual identification in the Chrome toolbar.
