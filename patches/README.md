# Patches

`Menu.qml` is a full upstream copy with `NYXIRI-BEGIN/END` blocks, not a
context diff. `MenuModel.js` is upstream plus one Nyxiri security patch
(the `NYXIRI-SECURITY` guard-id check in `guardLine`, which drops ids that
are unsafe to interpolate into the generated bash script); everything else
in it is byte-for-byte upstream. `BarWidget.qml` and `manifest.json` are
fork-owned files.

| Path | Meaning |
| --- | --- |
| `upstream/Menu.qml` | Pristine upstream menu from the last merge |
| `upstream/MenuModel.js` | Pristine upstream model from the last merge |
| `upstream/menu-manifest.json` | Upstream manifest, for reference |
| `../Menu.qml` | Working copy: upstream plus Nyxiri blocks |
| `../MenuModel.js` | Upstream plus the `NYXIRI-SECURITY` guard-id patch |

Baseline note (2026-11-26): `upstream/` currently holds upstream main plus
unmerged upstream PR #19938 (typo-tolerant menu search), applied here as a
forward-port. The structure test requires the working copies to differ from
`upstream/` only by the Nyxiri patch, so the PR lives in the baseline, not
just in the working copies. When upstream merges the PR, `sync-upstream.sh`
reconciles it: if upstream's version matches this port, the merge is clean;
if it differs, `git merge-file` flags the conflict for review.

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
