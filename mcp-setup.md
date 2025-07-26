# Shadcn/UI MCP Server Setup

This project now includes the shadcn/ui MCP (Model Context Protocol) server configuration, which provides AI assistants with access to shadcn/ui component documentation and examples.

## What the Shadcn MCP Server Provides

The shadcn-ui MCP server offers the following tools:
- `list_shadcn_components` - Get a list of all available shadcn/ui components
- `get_component_details` - Get detailed information about a specific component  
- `get_component_examples` - Get usage examples for a specific component
- `search_components` - Search for components by keyword

## Setup Instructions

### For Cursor IDE (Recommended)

The MCP server is already configured in `.cursor/mcp.json`. After starting Cursor:

1. Go to Cursor Settings > Tools & Integrations
2. Click "New MCP Server" (if not already configured)
3. Or refresh the MCP servers if already configured
4. The shadcn-ui-server should appear in your available tools

### For Claude Desktop

1. Copy the configuration from `claude_desktop_config.json` to your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Restart Claude Desktop for the changes to take effect

### Alternative: Direct NPX Usage

You can also run the MCP server directly:

```bash
npx -y shadcn-ui-mcp-server
```

## Usage Examples

Once configured, you can ask your AI assistant questions like:

- "List all available shadcn/ui components"
- "Show me details about the Button component"
- "Give me examples of using the Card component"
- "Search for components related to forms"

## Requirements

- Node.js installed on your system
- Internet connection (for npx to download the package)

## Troubleshooting

If you encounter issues:

1. Ensure Node.js is installed: `node --version`
2. Test the server directly: `npx -y shadcn-ui-mcp-server`
3. Check your MCP configuration file syntax
4. Restart your IDE/application after configuration changes

For debugging, you can use the MCP Inspector:
```bash
npm run inspector
```

This will provide a URL to access debugging tools in your browser. 