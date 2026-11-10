# Patches

`Menu.qml` is a full upstream copy with `NYXIRI-BEGIN/END` blocks, not a
context diff. `MenuModel.js` is kept byte-for-byte unmodified. `BarWidget.qml`
and `manifest.json` are fork-owned files.

| Path | Meaning |
| --- | --- |
| `upstream/Menu.qml` | Pristine upstream menu from the last merge |
| `upstream/MenuModel.js` | Pristine upstream model from the last merge |
| `upstream/menu-manifest.json` | Upstream manifest, for reference |
| `../Menu.qml` | Working copy: upstream plus Nyxiri blocks |
| `../MenuModel.js` | Unmodified upstream copy |

Block names in use:

- `nyxiri-menu-core` — hover timers, flag probe and hardcoded rows
- `nyxiri-open-payload` — `hoverOpen` from the summon payload
- `nyxiri-menu-merge` — merging the hardcoded rows into the shipped menu
- `nyxiri-hover-cancel`, `nyxiri-hover-cancel-all` — stop a pending dwell
  when navigation changes

To rebase:

```sh
scripts/sync-upstream.sh
```

It three-way merges `Menu.qml` and `MenuModel.js` against `upstream/`, updates
the baseline, and writes `Menu.qml.rebase` on conflicts.
