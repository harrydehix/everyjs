for file in ./dist/esm/*.js; do
  echo "Updating $file contents..."
  sed -i '' "s/\.js'/\.cjs'/g" "$file"
  echo "Renaming $file to ${file%.js}.cjs..."
  mv "$file" "${file%.js}.cjs"
done