---
title: Setting Up a New Mac
date: 2026-05-10
---

First new Mac in 7 years. Nice to have a clean slate. Installs and config changes so far:

- Remap caps key to escape
- Remove Pages/Numbers other mac bloatware
- Install Ghostty, enable VIM mode
- Set up inbox & email
- Install Codex (requires developer tools)
- Install Claude Code
- Install Tailscale
- Install Hush (cookie blocker)
- Copy root Codex AGENTS.md
- Install Fish shell (installer not homebrew)
- Install Starship.rs, add to fish and zsh config
- Copy over .vimrc from other machine; install vim-plug
- Copy over .zshrc
- Copy over .gitconfig and .gitignore_global
- Install uv
- Install Alfred; setup ghostty folder workflow
- Install Cursor
- Install Sublime Text, set up preferences (so blazingly fast, still love it for quick file inspection and edits)
- Download Atlas, Edge (Edge is great, preferred browser when devving)
- Setup 'locations' in network settings so I can set DNS to pi-hole when at home (bugs me I can't set per network DNS like I can on iOS but oh well)
- Install Mise, setup shell paths, mise manages node for me
- Run `mise install` for rg, gh, node, fzf, bat, zoxide and pi
- Setup gh cli 
- Download Proton VPN
- Disable sticky keys on Sublime, Cursor (so VIM mode works nicely)

## Specific config files

### Sublime Text preferences

```json
{
	"theme": "auto",
	"color_scheme": "auto",
	"dark_color_scheme": "Mariana.sublime-color-scheme",
	"light_color_scheme": "Solarized (light).sublime-color-scheme",
	"dark_theme": "Default Dark.sublime-theme",
	"light_theme": "Solarized (light).sublime-theme",
	"index_files": false,
	"hot_exit": false,
	"remember_open_files": false,
	"font_size": 16,
	"dictionary": "Packages/Language - English/en_GB.dic",
    "folder_exclude_patterns": ["node_modules"],
    "ignored_packages": [
	],
}
```

### Fish config

```fish
# Load the Starship prompt for interactive Fish sessions only.
if status is-interactive
    starship init fish | source

    # Use vi-style key bindings in Fish.
    set -g fish_key_bindings fish_vi_key_bindings
end

# Ensure user-installed binaries in ~/.local/bin are on PATH.
fish_add_path "/Users/lod/.local/bin"

# Make Sublime Text available as `subl`.
fish_add_path "/Applications/Sublime Text.app/Contents/SharedSupport/bin"

# Enable mise's shell integration for automatic per-project tool selection.
~/.local/bin/mise activate fish | source

# Enable zoxide's smarter directory-jumping commands in Fish.
zoxide init fish | source
```

### Zsh config

```zsh
# Load the Starship prompt for interactive zsh sessions.
eval "$(starship init zsh)"

# Ensure user-installed binaries in ~/.local/bin are on PATH.
. "$HOME/.local/bin/env"

# Enable mise's shell integration for automatic per-project tool selection.
eval "$(mise activate zsh)"

# Enable zoxide's smarter directory-jumping commands in zsh.
eval "$(zoxide init zsh)"
```

### Mise config

```toml
[tools]
rg = "latest"
gh = "latest"
node = "lts"
fzf = "latest"
bat = "latest"
zoxide = "latest"
"npm:@earendil-works/pi-coding-agent" = "latest"
```

### Git config

```gitconfig
[init]
	defaultBranch = main
[core]
	editor = vim
	autocrlf = input
	excludesfile = ~/.gitignore_global
[pull]
	rebase = true
[commit]
	gpgsign = false
[gpg]
	format = ssh
```

### Global gitignore

```gitignore
xcuserdata/
.DS_Store
.build/
```

### Vim config

```vim
call plug#begin()
Plug 'tpope/vim-sensible'
Plug 'tpope/vim-sleuth'
Plug 'tpope/vim-endwise'
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
call plug#end()

" autoclose logic
inoremap " ""<left>
inoremap ' ''<left>
inoremap ( ()<left>
inoremap [ []<left>
inoremap { {}<left>
inoremap {<CR> {<CR>}<ESC>O
inoremap {;<CR> {<CR>};<ESC>O

" enable syntax highlighting
syntax on

" enable powerline fonts for airline
let g:airline_powerline_fonts = 1
let g:airline_theme='minimalist'

" change regex engine
set re=0

" Enable filetype-specific plugins
filetype plugin on

set wrap
set linebreak

set number
set numberwidth=4
```
