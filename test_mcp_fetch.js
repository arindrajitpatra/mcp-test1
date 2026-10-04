/**
 * Simple Node.js Client to test the Docker mcp/fetch MCP Server
 * Communicates via JSON-RPC 2.0 over Stdio (spawn docker process)
 */

import { spawn } from 'child_process';
import readline from 'readline';

async function runFetchMcpTest(urlToFetch) {
  console.log(`\n🚀 Starting Docker MCP Server 'mcp/fetch'...`);
  console.log(`🌐 Target URL: ${urlToFetch}\n`);

  // Spawn Docker process running mcp/fetch container
  const dockerProc = spawn('docker', ['run', '-i', '--rm', 'mcp/fetch']);

  const rl = readline.createInterface({
    input: dockerProc.stdout,
    terminal: false
  });

  // Helper to send JSON-RPC requests
  function sendJsonRpc(obj) {
    const jsonStr = JSON.stringify(obj) + '\n';
    dockerProc.stdin.write(jsonStr);
  }

  // Handle incoming JSON-RPC responses
  rl.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);

      // Step 1 Response: Initialize Result
      if (msg.id === 1) {
        console.log('✅ Connected to MCP Server info:', msg.result.serverInfo);
        console.log('📋 Requesting tool list...\n');
        sendJsonRpc({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list'
        });
      }

      // Step 2 Response: Tools List Result
      else if (msg.id === 2) {
        const tools = msg.result.tools.map(t => t.name);
        console.log(`🛠️ Available Tools exposed by server: [ ${tools.join(', ')} ]`);
        console.log(`📡 Invoking 'fetch' tool for URL: ${urlToFetch}...\n`);
        
        sendJsonRpc({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'fetch',
            arguments: {
              url: urlToFetch,
              max_length: 1000
            }
          }
        });
      }

      // Step 3 Response: Tool Call Result (Fetched Markdown Content)
      else if (msg.id === 3) {
        console.log('=================== FETCH RESULT (MARKDOWN) ===================');
        if (msg.result && msg.result.content) {
          msg.result.content.forEach(item => {
            console.log(item.text);
          });
        } else if (msg.error) {
          console.error('❌ Error executing fetch tool:', msg.error);
        }
        console.log('================================================================');
        
        // Clean exit
        dockerProc.kill();
        process.exit(0);
      }
    } catch (err) {
      // Non-JSON output line
    }
  });

  dockerProc.stderr.on('data', (data) => {
    // Log docker container debug messages if any
  });

  // Step 1: Send MCP Initialize handshake
  sendJsonRpc({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '1.0.0',
      capabilities: {},
      clientInfo: { name: 'VSCodeClientTest', version: '1.0.0' }
    }
  });
}

// Test with Anthropic Model Context Protocol announcement page
const targetUrl = process.argv[2] || 'https://www.anthropic.com/news/model-context-protocol';
runFetchMcpTest(targetUrl);
