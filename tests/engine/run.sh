#!/bin/sh
# Headless engine tests: compile the game logic to plain JS, then run each simulation.
set -e
cd "$(dirname "$0")/../.."
rm -rf .sim
npx tsc --ignoreConfig --outDir .sim --module commonjs --target es2020 --resolveJsonModule \
  --esModuleInterop --skipLibCheck --types node --rootDir src src/game/engine.ts >/dev/null 2>&1 || true
cp src/game/rooms.json .sim/game/
for t in combat loot modes; do
  echo "== $t"
  node "tests/engine/$t.js"
done
