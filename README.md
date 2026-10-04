# URL to Markdown Fetcher (MCP + Separate Folder Output)

This system prompts the user for a website URL, fetches the page via the Docker **`mcp/fetch`** server, converts it to Markdown, and saves the output file inside a dedicated **`fetched_markdown/`** directory.

---

## 📁 Directory Structure

```text
test2/
├── .vscode/
│   └── mcp.json                 # Docker mcp/fetch server configuration
├── fetched_markdown/            # SEPARATE FOLDER where all .md output files are saved
│   └── httpbin_org_html.md      # Example generated .md file
├── agents/
│   └── url_to_md_agent.md       # Declarative prompt (@UrlToMarkdownAgent)
├── .clinerules                  # Instructions for AI chat agents
├── .github/
│   └── copilot-instructions.md  # Copilot instructions
├── fetch_cli.js                 # Interactive CLI tool (prompts user for URL)
└── README.md                    # Setup guide
```

---

## 🚀 Usage Option A: Interactive Terminal Script

Run the interactive CLI script. It will **prompt you to enter a URL**:

```bash
node fetch_cli.js
```

### Prompt Interaction Example:
```text
🔗 Please provide the website URL you want to fetch and convert to Markdown: https://httpbin.org/html

📡 Fetching URL: https://httpbin.org/html...

==================================================
✅ SUCCESS! Markdown file created successfully:
📁 File Path: test2/fetched_markdown/httpbin_org_html.md
==================================================
```

---

## 💬 Usage Option B: VS Code Chat / Copilot

1. Open Copilot or Cline Chat in VS Code.
2. Start the chat. The AI will prompt you:
   > *"Please provide the website URL you want me to fetch and save as Markdown."*
3. Enter your URL (e.g. `https://example.com`).
4. The AI executes `mcp/fetch` via Docker and saves the result inside **[`fetched_markdown/`](./fetched_markdown/)**.
5. This is branch1 change
6. This is branch1 change2


5. Trying marge conflict
6. This is branch2