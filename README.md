# Nyxiri menu

A fork of Omarchy's `omarchy.menu` plugin that:

- makes the bar trigger icon customizable (glyph, image/SVG, wordmark, tint);
- opens submenus on hover after a ~400 ms dwell.

It is the main Omarchy menu (app launcher, opened from the NYXIRI wordmark trigger on the bar). Left-click the trigger opens the menu; right-click opens a terminal. It used to carry a hardcoded Nyxiri settings submenu; that is gone, settings live in the Nyxiri settings window opened from the bat icon on the bar.

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

The trigger settings are edited in the [Nyxiri bar](https://github.com/Deoxizn/nyxiri) settings window (Menu tab, Menu Trigger section) or with `omarchy bar set`. Without the Nyxiri bar the menu still works; the settings are just edited from the command line.

Go back with:

```sh
omarchy plugin disable pizza.dirty.nyxiri-menu
omarchy plugin enable omarchy.menu
```

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

The default is on. Toggle it in the Nyxiri settings window (Menu tab, Menu Trigger section, **Hover opens submenus**), which
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
