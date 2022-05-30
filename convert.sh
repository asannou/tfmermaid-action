#!/bin/sh

temp=$(mktemp $1.XXXXXXXXXX)

terraform init -backend=false
terraform graph | node $(dirname $0)/index.mjs $1 $2 > $temp
mv $temp $1
