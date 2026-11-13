# Nyxiri menu

A fork of Omarchy's `omarchy.menu` plugin that:

- adds a hardcoded **Nyxiri** submenu with settings, per-tab shortcuts, bulk
  pill mode switches and the hover-submenu toggle;
- makes the bar trigger icon customizable (glyph, image/SVG, wordmark, tint);
- opens submenus on hover after a ~400 ms dwell.

It still opens and behaves like the normal Omarchy menu: `omarchy menu`, the
menu keybindings, and the three-finger gesture all resolve to the enabled menu
clone.

The plugin id is `pizza.dirty.nyxiri-menu` and the manifest declares
`omarchy.clonedFrom: "omarchy.menu"`, so enabling it disables the stock menu
automatically.

## Install

```sh
omarchy plugin add https://github.com/Deoxizn/nyxiri-menu.git --enable
omarchy-shell shell rescanPlugins
omarchy bar put pizza.dirty.nyxiri-menu
```

`omarchy plugin add` is the install: it clones a real checkout (so
`omarchy plugin update` works), validates the manifest, and `--enable`
switches the plugin on. `scripts/install.sh` in this repo is just a
wrapper around that command. Live-edit with `scripts/install.sh --link`
instead, but note a symlinked install always fails `omarchy plugin
update` validation: Omarchy's validator refuses symlinks inside a
plugin folder.

Requires the [Nyxiri bar](https://github.com/Deoxizn/nyxiri) for the settings
rows to do anything. Without it the menu still works; the Nyxiri rows report a
failed IPC call.

Go back with:

```sh
omarchy plugin disable pizza.dirty.nyxiri-menu
omarchy plugin enable omarchy.menu
```

## Nyxiri submenu

Hardcoded in `Menu.qml` (merged with the shipped JSONC menu), so it needs no
extension file:

| Row | Action |
| --- | --- |
| Nyxiri settings | `omarchy-shell pizza.dirty.nyxiri openSettings` |
| Bar appearance | Opens the card on the Appearance tab |
| Monitor rules | Opens the card on the Monitors tab |
| Widget scope | Opens the card on the Widgets tab |
| Island pills everywhere | Sets all three sections to island |
| Mini pills everywhere | Sets all three sections to mini |
| Hover opens submenus | Toggles the hover-dwell flag |

A user extension can still override any of these ids
(`nyxiri.settings`, `nyxiri.appearance`, …), exactly like shipped rows.

## Trigger icon

The bar widget reads these inline settings from its `shell.json` layout entry:

| Key | Values | Default |
| --- | --- | --- |
| `iconMode` | `glyph`, `image`, `wordmark` | `glyph` |
| `glyph` | `omarchy`, `arch`, `custom` | `omarchy` |
| `customGlyph` | any string | empty |
| `iconFont` | font family for a custom glyph | `omarchy` |
| `iconSource` | image or SVG path/URL | empty |
| `wordmark` | text in wordmark mode, shown uppercased with wide letterSpacing | `Nyxiri` |
| `tint` | recolour an image with the bar foreground | `true` |
| `hoverOpen` | hover submenus for this trigger | `true` |

For example:

```sh
omarchy bar set pizza.dirty.nyxiri-menu iconMode image
omarchy bar set pizza.dirty.nyxiri-menu iconSource /home/me/Pictures/nyxiri.svg
omarchy bar set pizza.dirty.nyxiri-menu tint true
omarchy bar set pizza.dirty.nyxiri-menu glyph arch
```

Left-click opens the menu (passing `hoverOpen` in the summon payload);
right-click opens a terminal, as upstream does.

## Hover submenus

A row with children opens after the pointer rests on it for `hoverDwell`
(400 ms). Moving off cancels. Search input suppresses hover-open so drilling
does not lose the query.

The default is on. Toggle it from **Nyxiri → Hover opens submenus**, which
creates or removes:

```
~/.local/state/omarchy/toggles/nyxiri-hover-submenus-off
```

The trigger's `hoverOpen` setting can override it per instance.

## Development

```sh
scripts/test.sh
scripts/sync-upstream.sh
```

`Menu.qml` is a full upstream copy with `NYXIRI-BEGIN/END` blocks;
`MenuModel.js` is untouched. `upstream/` holds the last pristine merge base.
Conflicts during a rebase are written to `Menu.qml.rebase`.

## Licence

MIT.
