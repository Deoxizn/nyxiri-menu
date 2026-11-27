# Nyxiri menu

The main Omarchy menu (app launcher). Left-click the NYXIRI trigger on the bar to open it. Right-click opens a terminal.

## Security note

Menu definition files are code, not data. `action:` strings run as shell commands, and `when:` / `checked:` / `disabled:` guards are evaluated by a generated shell script, so anyone who can write a menu definition file gets code execution as your user. Only load menu files from sources you trust.

## Install

```sh
omarchy plugin add https://github.com/Deoxizn/nyxiri-menu.git --enable
hexciri-shell shell rescanPlugins
omarchy bar put pizza.dirty.nyxiri-menu
```

To go back to the stock menu:

```sh
omarchy plugin disable pizza.dirty.nyxiri-menu
omarchy plugin enable hexciri.menu
```

## Trigger icon

Change how the trigger looks in the Nyxiri bar settings window (Menu tab), or from the command line:

```sh
omarchy bar set pizza.dirty.nyxiri-menu iconMode image
omarchy bar set pizza.dirty.nyxiri-menu iconSource /home/me/Pictures/nyxiri.svg
omarchy bar set pizza.dirty.nyxiri-menu tint true
omarchy bar set pizza.dirty.nyxiri-menu glyph arch
```

| Setting | What it does | Default |
| --- | --- | --- |
| `iconMode` | `glyph`, `image`, or `wordmark` | `glyph` |
| `glyph` | `omarchy`, `arch`, or `custom` | `omarchy` |
| `customGlyph` | your own glyph, used when `glyph` is `custom` | empty |
| `iconFont` | font for a custom glyph | `omarchy` |
| `iconSource` | image or SVG file for image mode | empty |
| `wordmark` | text shown in wordmark mode | `Nyxiri` |
| `tint` | recolour an image to match the bar | `true` |
| `hoverOpen` | hover opens submenus for this trigger | `true` |

## Hover submenus

Submenus open when you rest the pointer on them for a moment. Turn it off in the Nyxiri bar settings window (Menu tab, **Hover opens submenus**).
