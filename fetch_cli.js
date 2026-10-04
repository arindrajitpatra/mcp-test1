/**
 * Interactive Fetch to Markdown CLI
 * 1. Prompts the user to enter a URL.
 * 2. Uses Docker mcp/fetch MCP Server to fetch web content as Markdown.
 * 3. Saves the output as a .md file in the 'fetched_markdown' directory.
 */

import { spawn } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, 'fetched_markdown');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function sanitizeFilename(url) {
  try {
    const parsed = new URL(url);
    let name = parsed.hostname + parsed.pathname;
    name = name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    return name.slice(0, 60) + '.md';
  } catch (e) {
    return 'fetched_page_' + Date.now() + '.md';
  }
}

async function fetchUrlAndSave(urlToFetch) {
  console.log(`\n📡 Fetching URL: ${urlToFetch}...`);

  const dockerProc = spawn('docker', ['run', '-i', '--rm', 'mcp/fetch']);

  const rl = readline.createInterface({
    input: dockerProc.stdout,
    terminal: false
  });

  function sendJsonRpc(obj) {
    dockerProc.stdin.write(JSON.stringify(obj) + '\n');
  }

  rl.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);

      // Step 1: Handshake
      if (msg.id === 1) {
        sendJsonRpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
      }

      // Step 2: Call fetch tool
      else if (msg.id === 2) {
        sendJsonRpc({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'fetch',
            arguments: {
              url: urlToFetch,
              max_length: 50000
            }
          }
        });
      }

      // Step 3: Save Markdown Output
      else if (msg.id === 3) {
        if (msg.result && msg.result.content) {
          const markdownContent = msg.result.content.map(c => c.text).join('\n\n');
          const fileName = sanitizeFilename(urlToFetch);
          const filePath = path.join(outputDir, fileName);

          fs.writeFileSync(filePath, markdownContent, 'utf-8');

          console.log('\n==================================================');
          console.log(`✅ SUCCESS! Markdown file created successfully:`);
          console.log(`📁 File Path: ${filePath}`);
          console.log('==================================================\n');
        } else if (msg.error) {
          console.error('❌ Error fetching page:', msg.error);
        }

        dockerProc.kill();
        process.exit(0);
      }
    } catch (err) {
      // Non-JSON stdout
    }
  });

  sendJsonRpc({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '1.0.0', capabilities: {}, clientInfo: { name: 'FetchCli', version: '1.0.0' } }
  });
}

// User Prompt Logic
const userRl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const inputUrl = process.argv[2];

if (inputUrl) {
  userRl.close();
  fetchUrlAndSave(inputUrl);
} else {
  userRl.question('🔗 Please provide the website URL you want to fetch and convert to Markdown: ', (answer) => {
    userRl.close();
    const url = answer.trim();
    if (!url) {
      console.log('❌ No URL provided. Exiting.');
      process.exit(1);
    }
    fetchUrlAndSave(url);
  });
}
