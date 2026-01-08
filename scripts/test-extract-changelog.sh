#!/bin/bash

# test-extract-changelog.sh
# Test the extract-changelog.sh script

set -e

# Create a test CHANGELOG.md
cat > test-changelog.md << 'EOF'
# Changelog

## [1.2.0] - 2024-01-15

### Added
- New JSON formatter tool
- Added image format converter
- Implemented timestamp converter

### Changed
- Improved UI layout
- Enhanced search performance

### Fixed
- Fixed UI rendering issues
- Resolved memory leaks

## [1.1.0] - 2024-01-10

### Added
- Initial version release
- Basic tool card display
- Support for tool category filtering

## [1.0.0] - 2024-01-01

### Added
- Project initialization
- Basic architecture setup
EOF

echo "=== Testing extract-changelog.sh ==="
echo

echo "Test 1: Extract version 1.2.0"
echo "------------------------------"
./extract-changelog.sh 1.2.0 test-changelog.md
echo

echo "Test 2: Extract version 1.1.0"
echo "------------------------------"
./extract-changelog.sh 1.1.0 test-changelog.md
echo

echo "Test 3: Extract version 1.0.0"
echo "------------------------------"
./extract-changelog.sh 1.0.0 test-changelog.md
echo

echo "Test 4: Extract non-existent version (0.9.0)"
echo "--------------------------------------------"
./extract-changelog.sh 0.9.0 test-changelog.md
echo

echo "Test 5: Test with v prefix (v1.2.0)"
echo "-----------------------------------"
./extract-changelog.sh v1.2.0 test-changelog.md
echo

# Test with different CHANGELOG format
cat > test-changelog2.md << 'EOF'
# Changelog

## 2.0.0 - 2024-02-01

### Major Changes
- Complete UI redesign
- Added plugin system

## 1.5.0 - 2024-01-20

### Added
- Export functionality
- Keyboard shortcuts
EOF

echo "Test 6: Different format (without brackets)"
echo "--------------------------------------------"
./extract-changelog.sh 1.5.0 test-changelog2.md
echo

echo "Test 7: File doesn't exist"
echo "---------------------------"
./extract-changelog.sh 1.0.0 non-existent.md
echo

# Clean up
rm -f test-changelog.md test-changelog2.md