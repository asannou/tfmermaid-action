#!/bin/bash

set -euo pipefail

target=$1
label=${2-}
output_temp=$(mktemp "$target.XXXXXXXXXX")
data_dir=$(mktemp -d "${TMPDIR:-/tmp}/tfmermaid.XXXXXXXXXX")
override_seed=$(mktemp tfmermaid.XXXXXXXXXX)
override_file="${override_seed}_override.tf"
mv "$override_seed" "$override_file"

cleanup() {
  rm -f -- "$output_temp" "$override_file"
  rm -rf -- "$data_dir"
}
trap cleanup EXIT

printf '%s\n' 'terraform {' '  backend "local" {}' '}' > "$override_file"

TF_DATA_DIR="$data_dir" terraform init \
  -reconfigure \
  -backend-config="path=$data_dir/terraform.tfstate"
TF_DATA_DIR="$data_dir" terraform graph -type=plan |
  TF_MODULES_FILE="$data_dir/modules/modules.json" \
  node "$(dirname "$0")/index.mjs" "$target" "$label" > "$output_temp"
mv "$output_temp" "$target"
