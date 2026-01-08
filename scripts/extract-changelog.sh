#!/bin/bash

# extract-changelog.sh
# Extract changelog entry for a specific version
# Usage: ./extract-changelog.sh <version>

set -e

VERSION="$1"
CHANGELOG_FILE="${2:-CHANGELOG.md}"

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version> [changelog-file]"
    exit 1
fi

if [ ! -f "$CHANGELOG_FILE" ]; then
    echo "No $CHANGELOG_FILE found, using default release notes"
    echo "Automated release for version $VERSION"
    exit 0
fi

# Escape dots in version for regex
VERSION_ESCAPED=$(echo "$VERSION" | sed 's/\./\\./g')

# Find the line number of the version header
# Supports formats like:
# ## [1.2.3]
# ## [v1.2.3]
# ## 1.2.3
# ## v1.2.3
START_LINE=$(grep -n -E "^## \[?v?$VERSION_ESCAPED\]?" "$CHANGELOG_FILE" | head -1 | cut -d: -f1)

if [ -z "$START_LINE" ]; then
    # Try alternative pattern without brackets
    START_LINE=$(grep -n -E "^## v?$VERSION_ESCAPED\b" "$CHANGELOG_FILE" | head -1 | cut -d: -f1)
fi

if [ -z "$START_LINE" ]; then
    echo "No changelog entry found for version $VERSION"
    echo "Automated release for version $VERSION"
    exit 0
fi

# Get the next version header line
TOTAL_LINES=$(wc -l < "$CHANGELOG_FILE")

# Look for the next version header after the current one
NEXT_VERSION_LINE=$(tail -n +$((START_LINE + 1)) "$CHANGELOG_FILE" | grep -n "^## " | head -1 | cut -d: -f1)

# Extract the changelog entry
if [ -n "$NEXT_VERSION_LINE" ]; then
    END_LINE=$((START_LINE + NEXT_VERSION_LINE - 1))
    CHANGELOG_ENTRY=$(sed -n "${START_LINE},${END_LINE}p" "$CHANGELOG_FILE")
else
    # If no next version found, extract to the end of file
    CHANGELOG_ENTRY=$(tail -n +"${START_LINE}" "$CHANGELOG_FILE")
fi

# Trim empty lines and limit output
CHANGELOG_ENTRY=$(echo "$CHANGELOG_ENTRY" | sed -e '/^[[:space:]]*$/d' | head -30)

echo "$CHANGELOG_ENTRY"