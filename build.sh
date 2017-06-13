mkdir dist
./node_modules/.bin/flow-remove-types src/index.js > dist/index.js
cp views/* dist/
