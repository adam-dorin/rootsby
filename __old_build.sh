# !#/bin/bash

echo "============================"
echo "Cleaning dist folder"
if test -d ./dist
    rm -rf ./dist
end
echo "============================"
echo "Building project"
tsc --project tsconfig.json
echo "Build complete"
echo "============================"
echo "Post build tasks"

if [ "$argv" = "qp" ]
  npm version patch
end

echo "* Move package.json to dist folder"
cat package.json > ./dist/package.json
echo "* Move README.md to dist folder"
cat README.md > ./dist/README.md

# qp = quick publish
if [ "$argv" = "qp" ]
    cd ./dist
    echo "Publishing to npm"
    npm publish
    cd ..
end