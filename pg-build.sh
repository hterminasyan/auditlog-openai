#!/bin/bash

# Step 1: Create the necessary folder structure
mkdir -p gen/pg/db

# Step 2: Generate a precompiled cds model
cds compile '*' > gen/pg/db/csn.json

# Step 3: Create package.json
cat << EOF > gen/pg/package.json
{
  "engines": {
    "node": "^18"
  },
  "dependencies": {
    "@sap/cds": "*",
    "@cap-js/postgres": "^1.0.1"
  },
  "scripts": {
    "start": "cds-deploy"
  }
}
EOF

