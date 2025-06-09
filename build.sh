#!/bin/bash
echo "============================"
echo "Cleaning dist folder"
if test -d ./dist; then
    rm -rf ./dist
fi
echo "============================"
echo "Building project"
tsc --project tsconfig.json
echo "Build complete"
echo "============================"
echo "Post build tasks"

if [ "$1" = "qp" ]; then
  npm version patch
fi

echo "* Move package.json to dist folder"
cat package.json > ./dist/package.json
echo "* Move README.md to dist folder"
cat README.md > ./dist/README.md

# qp = quick publish
if [ "$1" = "qp" ]; then
    cd ./dist
    echo "Publishing to npm"
    npm publish
    cd ..
fi
