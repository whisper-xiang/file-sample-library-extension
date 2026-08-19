#!/bin/zsh
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
dist="$root/dist"
zipname="file-sample-library.zip"

mkdir -p "$dist"
rm -f "$dist/$zipname"

cd "$root"
zip -X -r "$dist/$zipname" \
  manifest.json \
  popup.html \
  popup.js \
  popup.css \
  contact-wechat.png \
  icons \
  public \
  samples \
  _locales \
  -x "*.DS_Store" \
  -x "**/.DS_Store"

echo "Created $dist/$zipname"
unzip -l "$dist/$zipname"
