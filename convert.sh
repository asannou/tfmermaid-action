#!/bin/bash

temp=$(mktemp "$1.XXXXXXXXXX")

terraform init -backend=false
terraform graph -type=plan | node "$(dirname "$0")/index.mjs" "$1" "$2" > "$temp"
mv "$temp" "$1"
