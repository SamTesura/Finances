#!/bin/bash
# Script to automatically update SRI hashes for CDN dependencies

echo "Updating SRI hashes for React dependencies..."

# Function to generate SRI hash
generate_sri() {
    local url=$1
    local hash=$(curl -s "$url" | openssl dgst -sha384 -binary | openssl base64 -A)
    echo "sha384-$hash"
}

# React
REACT_URL="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"
REACT_HASH=$(generate_sri "$REACT_URL")
echo "React hash: $REACT_HASH"

# ReactDOM
REACTDOM_URL="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"
REACTDOM_HASH=$(generate_sri "$REACTDOM_URL")
echo "ReactDOM hash: $REACTDOM_HASH"

# Update index.html with new hashes
sed -i "s|sha384-[A-Za-z0-9+/=]*" crossorigin=\"anonymous\"></script><!-- React -->|sha384-$REACT_HASH\" crossorigin=\"anonymous\"></script><!-- React -->|g" index.html
sed -i "s|sha384-[A-Za-z0-9+/=]*" crossorigin=\"anonymous\"></script><!-- ReactDOM -->|sha384-$REACTDOM_HASH\" crossorigin=\"anonymous\"></script><!-- ReactDOM -->|g" index.html

echo "SRI hashes updated successfully!"
echo "Please review index.html before committing."