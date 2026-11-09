#!/usr/bin/env bash
# index.html is the source of truth (light edition). This writes dark.html
# from it, so both editions always carry the same story and markup.
set -euo pipefail
cd "$(dirname "$0")"
sed -e 's/data-theme="light"/data-theme="dark"/' \
    -e 's/<meta name="color-scheme" content="light">/<meta name="color-scheme" content="dark">/' \
    -e 's/<meta name="theme-color" content="#FBFAFE">/<meta name="theme-color" content="#0D0B13">/' \
    -e 's/(beta)<\/title>/(beta) · Dark edition<\/title>/' \
    -e 's/href="dark.html"/href="index.html"/g' \
    -e 's/#i-moon/#i-sun/' \
    -e 's/<span>Dark<\/span>/<span>Light<\/span>/' \
    -e 's/>Dark edition</>Light edition</' \
    index.html > dark.html
echo "wrote dark.html"
