#!/usr/bin/env bash
# Prints every inventory row's sku, available and reserved, sorted, one per
# line — compare two runs to prove a suite run left inventory untouched.
#   scripts/inventory-snapshot.sh [inventory-url]
set -euo pipefail
url="${1:-${INVENTORY_URL:-http://inventory-service.gluon-local.svc.cluster.local:8080}}"
curl -sf -m 10 "$url/inventorys" | node --input-type=module -e "
  let s = ''
  process.stdin.on('data', (d) => { s += d })
  process.stdin.on('end', () => {
    const rows = JSON.parse(s).map((r) => r.sku + ' ' + r.quantityAvailable + ' ' + r.quantityReserved)
    console.log(rows.sort().join('\n'))
  })
"
