var obsidian = require('obsidian');

const DEFAULT_SETTINGS = {
    dateFormat: 'YYYY-MM-DD[T]HH:mm',
    createdField: 'created',
    modifiedField: 'updated',  // Changed from 'modified' to 'updated'
    minMinutesBetweenSaves: 0,
    blacklist: {
        folders: ['_templates', '.obsidian', '.trash'],
        filenames: ['README.md', 'LICENSE', 'LICENSE.md', 'CHANGELOG.md'],
        extensions: ['.js', '.ts', '.json', '.css', '.html', '.sql', '.py'],
        patterns: []
    }
};

class AutoDateManager extends obsidian.Plugin {
    async onload() {
        console.log('Loading Auto Date Manager');
        await this.loadSettings();
        
        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                if (file instanceof obsidian.TFile) {
                    this.handleFileChange(file);
                }
            })
        );
        
        this.registerEvent(
            this.app.vault.on('create', (file) => {
                if (file instanceof obsidian.TFile) {
                    setTimeout(() => this.handleFileChange(file), 100);
                }
            })
        );
        
        this.addCommand({
            id: 'update-current-file',
            name: 'Update current file dates',
            callback: () => this.updateCurrentFile()
        });
        
        this.addCommand({
            id: 'check-blacklist',
            name: 'Check if current file is blacklisted',
            callback: () => this.checkBlacklist()
        });
        
        this.addSettingTab(new AutoDateSettingTab(this.app, this));
    }
    
    async loadSettings() {
        const loadedData = await this.loadData();
        if (!loadedData) {
            this.settings = Object.assign({}, DEFAULT_SETTINGS);
        } else {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
            if (!this.settings.blacklist) {
                this.settings.blacklist = Object.assign({}, DEFAULT_SETTINGS.blacklist);
            } else {
                this.settings.blacklist = {
                    folders: this.settings.blacklist.folders || [],
                    filenames: this.settings.blacklist.filenames || [],
                    extensions: this.settings.blacklist.extensions || [],
                    patterns: this.settings.blacklist.patterns || []
                };
            }
        }
        console.log('Loaded settings:', this.settings);
    }
    
    async saveSettings() {
        await this.saveData(this.settings);
    }
    
    shouldFileBeIgnored(file) {
        if (!file || file.extension !== 'md') {
            return true;
        }
        
        const path = file.path;
        const name = file.name;
        const extension = '.' + file.extension;
        
        // Check folders
        if (this.settings.blacklist && this.settings.blacklist.folders) {
            for (const folder of this.settings.blacklist.folders) {
                if (folder && folder.trim()) {
                    if (path.startsWith(folder + '/') || path.includes('/' + folder + '/')) {
                        console.log('Blacklisted by folder:', folder);
                        return true;
                    }
                }
            }
        }
        
        // Check filenames
        if (this.settings.blacklist && this.settings.blacklist.filenames) {
            if (this.settings.blacklist.filenames.includes(name)) {
                console.log('Blacklisted by filename:', name);
                return true;
            }
        }
        
        // Check extensions
        if (this.settings.blacklist && this.settings.blacklist.extensions) {
            if (this.settings.blacklist.extensions.includes(extension)) {
                console.log('Blacklisted by extension:', extension);
                return true;
            }
        }
        
        // Check patterns
        if (this.settings.blacklist && this.settings.blacklist.patterns) {
            for (const pattern of this.settings.blacklist.patterns) {
                if (pattern && pattern.trim()) {
                    try {
                        const regex = new RegExp(pattern, 'i');
                        if (regex.test(name) || regex.test(path)) {
                            console.log('Blacklisted by pattern:', pattern);
                            return true;
                        }
                    } catch (e) {
                        console.error('Invalid regex:', pattern, e);
                    }
                }
            }
        }
        
        return false;
    }
    
    formatDate(date) {
        return window.moment(date).format(this.settings.dateFormat);
    }
    
    async handleFileChange(file) {
        if (this.shouldFileBeIgnored(file)) {
            console.log('File ignored:', file.path);
            return;
        }
        
        console.log('Processing file:', file.path);
        
        try {
            await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                const mTime = new Date(file.stat.mtime);
                const cTime = new Date(file.stat.ctime);
                
                if (!frontmatter[this.settings.createdField]) {
                    frontmatter[this.settings.createdField] = this.formatDate(cTime);
                    console.log('Added created date to', file.name);
                }
                
                frontmatter[this.settings.modifiedField] = this.formatDate(mTime);
                console.log('Updated modified date for', file.name);
            });
        } catch (e) {
            console.error('Error updating file:', e);
        }
    }
    
    async updateCurrentFile() {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
            new obsidian.Notice('No active file');
            return;
        }
        
        if (this.shouldFileBeIgnored(file)) {
            new obsidian.Notice(file.name + ' is blacklisted');
            return;
        }
        
        await this.handleFileChange(file);
        new obsidian.Notice('Updated dates for ' + file.name);
    }
    
    checkBlacklist() {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
            new obsidian.Notice('No active file');
            return;
        }
        
        console.log('=== Blacklist Debug ===');
        console.log('File:', file);
        console.log('Settings:', this.settings);
        
        const isBlacklisted = this.shouldFileBeIgnored(file);
        new obsidian.Notice(file.name + (isBlacklisted ? ' IS blacklisted' : ' is NOT blacklisted'));
    }
}

class AutoDateSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    
    display() {
        let containerEl = this.containerEl;
        containerEl.empty();
        
        containerEl.createEl('h2', {text: 'Auto Date Manager Settings'});
        
        new obsidian.Setting(containerEl)
            .setName('Date format')
            .setDesc('Moment.js format string')
            .addText(text => text
                .setPlaceholder('YYYY-MM-DD[T]HH:mm')
                .setValue(this.plugin.settings.dateFormat || 'YYYY-MM-DD[T]HH:mm')
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat = value || 'YYYY-MM-DD[T]HH:mm';
                    await this.plugin.saveSettings();
                }));
        
        new obsidian.Setting(containerEl)
            .setName('Created field')
            .addText(text => text
                .setValue(this.plugin.settings.createdField)
                .onChange(async (value) => {
                    this.plugin.settings.createdField = value || 'created';
                    await this.plugin.saveSettings();
                }));
        
        new obsidian.Setting(containerEl)
            .setName('Modified field')
            .setDesc('Field name for modified/updated date')
            .addText(text => text
                .setPlaceholder('updated')
                .setValue(this.plugin.settings.modifiedField)
                .onChange(async (value) => {
                    this.plugin.settings.modifiedField = value || 'updated';
                    await this.plugin.saveSettings();
                }));
        
        new obsidian.Setting(containerEl)
            .setName('Blacklisted folders')
            .setDesc('One per line')
            .addTextArea(text => {
                text.setValue((this.plugin.settings.blacklist.folders || []).join('\n'))
                    .onChange(async (value) => {
                        this.plugin.settings.blacklist.folders = value.split('\n').filter(x => x.trim());
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 4;
            });
        
        new obsidian.Setting(containerEl)
            .setName('Blacklisted filenames')
            .setDesc('One per line')
            .addTextArea(text => {
                text.setValue((this.plugin.settings.blacklist.filenames || []).join('\n'))
                    .onChange(async (value) => {
                        this.plugin.settings.blacklist.filenames = value.split('\n').filter(x => x.trim());
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 4;
            });
        
        new obsidian.Setting(containerEl)
            .setName('Blacklisted extensions')
            .setDesc('File extensions with dot, one per line')
            .addTextArea(text => {
                text.setValue((this.plugin.settings.blacklist.extensions || []).join('\n'))
                    .onChange(async (value) => {
                        this.plugin.settings.blacklist.extensions = value.split('\n').filter(x => x.trim());
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 4;
            });
        
        new obsidian.Setting(containerEl)
            .setName('Blacklist patterns')
            .setDesc('RegEx patterns, one per line')
            .addTextArea(text => {
                text.setValue((this.plugin.settings.blacklist.patterns || []).join('\n'))
                    .onChange(async (value) => {
                        this.plugin.settings.blacklist.patterns = value.split('\n').filter(x => x.trim());
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 4;
            });
    }
}

module.exports = AutoDateManager;