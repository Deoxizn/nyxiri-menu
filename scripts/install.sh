#!/usr/bin/env bash
# Install the Nyxiri menu fork. Enabling it makes the shell resolve
# `omarchy.menu` to this clone and disables the stock menu automatically.
set -euo pipefail

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
target=${NYXIRI_MENU_PLUGIN_DIR:-$HOME/.config/omarchy/plugins/devi.menu}
mode=link

usage() {
  cat <<USAGE
Usage: scripts/install.sh [--link|--copy] [--target DIR]

  --link   symlink this checkout to the plugin directory (default)
  --copy   copy the plugin files instead
  --target install somewhere other than $target
USAGE
}

while (( $# > 0 )); do
  case "$1" in
    --link) mode=link; shift ;;
    --copy) mode=copy; shift ;;
    --target) target=${2:?--target needs a directory}; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'install: unknown option: %s\n' "$1" >&2; exit 1 ;;
  esac
done

mkdir -p -- "$(dirname -- "$target")"

[[ -n $target && $target != "/" && $target != "$HOME" ]] || {
  printf 'install: refusing to replace %s\n' "$target" >&2
  exit 1
}

if [[ $mode == link ]]; then
  rm -rf -- "$target"
  ln -s -- "$root" "$target"
  printf 'linked %s -> %s\n' "$root" "$target"
else
  rm -rf -- "$target"
  mkdir -p -- "$target"
  cp -- manifest.json Menu.qml MenuModel.js BarWidget.qml README.md LICENSE "$target/"
  printf 'copied to %s\n' "$target"
fi

printf '\nNext:\n'
printf '  omarchy-shell shell rescanPlugins\n'
printf '  omarchy plugin enable devi.menu\n'
printf '  omarchy bar put devi.menu\n'
printf '\nEnable moves the menu clone in and disables the stock omarchy.menu.\n'
