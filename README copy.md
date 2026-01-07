# Dev Toolbox

A comprehensive Visual Studio Code extension providing essential developer tools directly within your editor. Streamline your workflow with built-in utilities for format conversion, time formatting, encoding/decoding, and more - all without leaving your coding environment.

## Features

🔄 Format Conversion

• JSON ↔ YAML: Seamlessly convert between JSON and YAML formats

• XML ↔ JSON: Transform XML data structures to JSON and vice versa  

• CSV ↔ JSON: Convert tabular CSV data to JSON arrays and back

• Base64 Encoding/Decoding: Quick encode and decode operations for strings and files

⏰ Time Utilities

• Timestamp Conversion: Convert between Unix timestamps and human-readable dates

• Timezone Handling: Convert times across different timezones

• Date Formatting: Multiple preset formats and custom date string manipulation

• Time Calculations: Add/subtract time units from dates

🔐 Encoding & Cryptography

• Hash Generation: MD5, SHA1, SHA256, SHA512 hash generation

• URL Encoding: Encode and decode URL components

• HTML Entity Encoding: Convert special characters to HTML entities

• JWT Decoder: Parse and validate JSON Web Tokens

📊 Developer Tools

• Color Converter: RGB, HEX, HSL color code conversions

• Regex Tester: Test and debug regular expressions with live feedback

• UUID Generator: Generate RFC-compliant UUIDs (v1, v4, v5)

• Lorem Ipsum Generator: Generate placeholder text for mockups

🌐 Network Utilities

• CORS Tester: Test Cross-Origin Resource Sharing configurations

• HTTP Headers Analyzer: Parse and analyze HTTP response headers

• API Response Formatter: Beautify and format API responses

## Requirements

No additional dependencies required. The extension works out-of-the-box with Visual Studio Code version 1.74.0 or higher.

## Extension Settings

This extension contributes the following settings:

Setting Description Default

toolbox.autoFormatOnPaste Automatically format pasted content when applicable false

toolbox.defaultDateFormat Default date format for time utilities "YYYY-MM-DD HH:mm:ss"

toolbox.showInStatusBar Show quick access button in status bar true

toolbox.theme UI theme preference ("light", "dark", "auto") "auto"

## Commands

Access all tools through the Command Palette (Ctrl+Shift+P or Cmd+Shift+P):

Command Description

Dev Toolbox: Show Main Panel Open the main toolbox interface

Dev Toolbox: Format Converter Access format conversion tools

Dev Toolbox: Time Utilities Open time and date manipulation tools

Dev Toolbox: Encoding Tools Access encoding and cryptography utilities

Dev Toolbox: Developer Tools Open developer-specific utilities

Dev Toolbox: Network Tools Access network diagnostic tools

## Usage Examples

JSON to YAML Conversion

1. Open command palette and select Dev Toolbox: Format Converter
2. Choose "JSON to YAML"
3. Paste your JSON data or load from file
4. Click "Convert" to get formatted YAML output

Timestamp Conversion

1. Use Dev Toolbox: Time Utilities
2. Select "Timestamp Converter"
3. Enter either timestamp or date to convert bidirectionally
4. Copy result with one click

Regex Testing

1. Open Dev Toolbox: Developer Tools → "Regex Tester"
2. Enter your regex pattern and test string
3. See matches highlighted in real-time
4. Get detailed match information and groups

## Known Issues

• Large file processing (>10MB) may cause performance delays

• Some complex nested JSON structures might require manual formatting after conversion

• Timezone calculations assume system timezone when not specified

## Release Notes

0.0.1

Initial release featuring:
• Core extension framework

• Basic extension structure and configuration

• Hello world functionality

## Contributing

Currently, this is a private project and external contributions are not accepted. For internal team contributions, please follow the established development workflow.

## License

This project is licensed under a Private License. All rights reserved.

This is proprietary software owned by the project maintainers. No part of this software may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the owner, except in cases where such copying is expressly permitted by applicable law.

For licensing inquiries, please contact: mailto:kuloud@outlook.com

## Acknowledgments

• Inspired by popular online developer tools

• Built with TypeScript and VS Code Extension API

• Thanks to all contributors who help improve this extension

## Support

• Report issues: https://github.com/kuloud/toolbox/issues

• Feature requests: https://github.com/kuloud/toolbox/discussions

• Documentation: https://github.com/kuloud/toolbox/wiki

Enhance your development workflow with Dev Toolbox - because great developers deserve great tools! 🚀