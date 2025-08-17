# Selective Date Updater for Obsidian

A powerful Obsidian plugin that automatically manages `created` and `modified` dates in your note's frontmatter, with advanced blacklist/exclusion rules to give you complete control over which files are tracked.

## Features

- 🕒 **Automatic Date Management**
  - Adds `created` and `updated` dates to new files
  - Updates `updated` date when you edit files
  - Adds both dates to existing files without frontmatter

- 🎯 **Selective Updates with Blacklist System**
  - **Folder exclusions**: Skip entire folders (e.g., `_templates`, `.obsidian`)
  - **Filename exclusions**: Skip specific files (e.g., `README.md`, `LICENSE`)
  - **Extension exclusions**: Skip file types (e.g., `.js`, `.css`)
  - **Pattern exclusions**: Use regex patterns for complex rules

- ⚙️ **Fully Customizable**
  - Configure date format (default: `YYYY-MM-DD[T]HH:mm`)
  - Customize field names (default: `created` and `updated`)
  - Set minimum time between updates

## Installation

### Manual Installation

1. Download `main.js` and `manifest.json` from the latest release
2. Create a folder named `selective-date-updater` in your vault's `.obsidian/plugins/` directory
3. Place the downloaded files in this folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community plugins

### From Community Plugins (Coming Soon)

This plugin will be available in the Obsidian Community Plugins browser once approved.

## Configuration

### Date Format
The plugin uses Moment.js format strings. Default is `YYYY-MM-DD[T]HH:mm` (ISO 8601).

Common formats:
- `YYYY-MM-DD[T]HH:mm` - ISO format with time
- `YYYY-MM-DD` - Date only
- `MMMM DD, YYYY` - Human readable

### Blacklist Rules

Configure which files to exclude from automatic date management:

#### Folders
```
_templates
.obsidian
.trash
archive
```

#### Filenames
```
README.md
LICENSE
CHANGELOG.md
```

#### Extensions
```
.js
.ts
.css
```

#### Regex Patterns
```
^\..*          # Hidden files starting with dot
-draft$        # Files ending with -draft
^temp-         # Files starting with temp-
```

## Commands

- **Update current file dates** - Manually update dates for the active file
- **Check if current file is blacklisted** - Debug command to check blacklist status

## Use Cases

- 📝 Track when notes were created and last modified
- 📚 Exclude documentation files (README, LICENSE) from tracking
- 🗂️ Skip template folders to preserve template variables
- 🔒 Ignore system folders like `.obsidian`

## Example Frontmatter

```yaml
---
created: 2025-01-15T14:30
updated: 2025-01-15T16:45
---

# Your note content here
```

## Compatibility

- Requires Obsidian v0.15.0 or higher
- Works on desktop and mobile

## Support

If you encounter any issues or have feature requests, please file them on the [GitHub repository](https://github.com/pontuskarlsson/obsidian-selective-date-updater/issues).

## License

MIT - See [LICENSE](LICENSE) for details.

## Author

Created by [Pontus Karlsson](https://github.com/pontuskarlsson)

## Acknowledgments

Inspired by other date management plugins in the Obsidian community, with the added power of selective file filtering.