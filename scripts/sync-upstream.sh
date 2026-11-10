#!/usr/bin/env bash
# Rebase the Nyxiri menu fork onto the installed Omarchy menu. BarWidget.qml
# and manifest.json are fork-owned and always kept; Menu.qml and MenuModel.js
# are three-way merged against upstream/.
set -euo pipefail

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
src=${OMARCHY_PATH:-/usr/share/omarchy}/shell/plugins/menu
upstream="$root/upstream"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

die() { printf 'sync-upstream: %s\n' "$*" >&2; exit 1; }

[[ -d $src ]] || die "upstream menu not found at $src"
for file in Menu.qml MenuModel.js manifest.json; do
  [[ -f $src/$file ]] || die "missing $src/$file"
done

merge_file() {
  local name=$1
  local work=$root/$name
  local base=$upstream/$name
  local theirs=$tmp/$name
  cp -- "$src/$name" "$theirs"

  if [[ ! -f $base ]]; then
    cp -- "$theirs" "$base"
    printf 'sync-upstream: installed first %s baseline\n' "$name"
    return
  fi

  if cmp -s -- "$work" "$base"; then
    cp -- "$theirs" "$work"
    printf 'sync-upstream: %s replaced (no local changes)\n' "$name"
  elif cmp -s -- "$base" "$theirs"; then
    printf 'sync-upstream: %s unchanged upstream\n' "$name"
  else
    cp -- "$work" "$tmp/ours-$name"
    if git merge-file -q --diff3 "$tmp/ours-$name" "$base" "$theirs"; then
      cp -- "$tmp/ours-$name" "$work"
      printf 'sync-upstream: %s merged cleanly\n' "$name"
    else
      cp -- "$tmp/ours-$name" "$root/$name.rebase"
      die "$name has conflicts; review $name.rebase, then move it over $name"
    fi
  fi

  cp -- "$theirs" "$base"
}

merge_file Menu.qml
merge_file MenuModel.js
cp -- "$src/manifest.json" "$upstream/menu-manifest.json"

printf 'sync-upstream: baseline refreshed from %s\n' "$src"
