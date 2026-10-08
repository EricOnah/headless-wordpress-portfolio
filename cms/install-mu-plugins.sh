#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
plugin_destination="$project_dir/wordpress/web/app/mu-plugins"
install -d "$plugin_destination"
for plugin in "$project_dir"/cms/mu-plugins/*.php; do
  install -m 644 "$plugin" "$plugin_destination/$(basename "$plugin")"
done
printf 'Portfolio CMS plugins installed in %s\n' "$plugin_destination"
