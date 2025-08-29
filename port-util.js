
const portsAndServices = [
  {
    port: 7071,
    protocol: 'http',
    service: 'Azure Function App (func start)',
    notes: 'Local Azure Function app running in VSCode. Example: `func start`.',
    timingSamples: [
        {
            serviceStatus: "on",
            timeMs:"4.2000"
         },
        {
            serviceStatus: "on",
            timeMs:"3.3000"
         },
        {
            serviceStatus: "on",
            timeMs:"3.4000"
         },
        {
            serviceStatus: "off",
            timeMs:"2045.39999"
         },
        {
            serviceStatus: "off",
            timeMs:"2034.40000"
         },
    ]
  },
  {
    port: 8384,
    protocol: 'http',
    service: 'Syncthing GUI',
    notes: 'HTTP web GUI, no authentication, started by SyncTrayzor. Check syncthingController.js',
    timingSamples: [
        {
            serviceStatus: "off",
            timeMs:"2055"
        },
        {
            serviceStatus: "on",
            timeMs:"8"
        },
        {
            serviceStatus: "on",
            timeMs:"12"
        }
    ]
  },
  {
    port: 58846,
    protocol: 'rpc',
    service: 'Deluge Daemon',
    notes: 'DelugeRPC, user=localclient, random generated password. Also Deluge desktop application starts in "standalone" mode which doesnt use daemon',
  },
  {
    port: 8112,
    protocol: 'http',
    service: 'Deluge Web',
    notes: 'Deluge web interface, includes JSON-RPC API.'
  },
  {
    port: 8080,
    protocol: 'http',
    service: 'Common HTTP',
    notes: ''
  },
  {
    service: 'Docker',
    protocol: 'tcp',
    port: 2375,
    notes:'must be specifically enabled',
    notes2:'https://docs.docker.com/reference/cli/dockerd/'
  },
  {
    service: 'Docker encrypted',
    protocol: 'tcp',
    port: 2376,
    notes:''
  },
  {
    service: 'Transmission',
    protocol: 'http rpc',
    port: 9091,
    notes:'HTTP RPC API'
  },
  {
    service: 'mcp-proxy',
    port: 8080,
    ports: [8080,6277],
    protocol: 'http',
    notes:'LLM MCP server proxt. The NodeJS default server listens on port 8080 and /mcp (streamable HTTP) and /sse (SSE) endpoints. Some guides use port 6277. mcp-proxy may be run by MCP Inspector',
    notes2:'https://www.oligo.security/blog/critical-rce-vulnerability-in-anthropic-mcp-inspector-cve-2025-49596'
  }
  
];

// Calls checkPortResponseTime with the port from input and logs the result
function checkPort() {
    const portInput = document.getElementById('port-input');
    if (!portInput) {
        addLogLine('Port input not found.');
        return;
    }
    const port = portInput.value.trim();
    if (!port) {
        addLogLine('Please enter a port number.');
        return;
    }
    if (isNaN(port) || +port < 1 || +port > 65535) {
        addLogLine('Invalid port number: ' + escapeHTML(port));
        return;
    }
    if (typeof checkPortResponseTime !== 'function') {
        addLogLine('checkPortResponseTime() is not defined.');
        return;
    }
    addLogLine('Checking port: ' + escapeHTML(port));
    checkPortResponseTime(+port)
        .then(result => {
            addLogLine('Port ' + port + ' response: ' + JSON.stringify(result));
        })
        .catch(err => {
            addLogLine('Port ' + port + ' error: ' + (err && err.message ? err.message : err));
        });

    
}

async function checkPortResponseTime(portNum) {
  return new Promise((resolve) => {
    const start = performance.now();
    const ws = new WebSocket(`ws://127.0.0.1:${portNum}`);
    const timeoutMs = 10 * 1000;

    let finished = false;

    function finish(result) {
      if (!finished) {
        finished = true;
        resolve(result);
      }
    }

    ws.onopen = () => {
      const elapsed = performance.now() - start;
      roundedNum = roundDigits(elapsed);
      ws.close();
      finish({ port: portNum, open: true, timeMs: roundedNum });
    };

    ws.onerror = () => {
      const elapsed = performance.now() - start;
      roundedNum = roundDigits(elapsed);
      finish({ port: portNum, open: false, timeMs: roundedNum });
    };

    // Fallback timeout if no response
    setTimeout(() => {
        const elapsed = performance.now() - start;
        roundedNum = roundDigits(elapsed);
        finish({ port: portNum, open: false, timeMs: roundedNum });
        try { ws.close(); } catch (e) {}
    }, timeoutMs);
  });


}

/**
 * Rounds a number to a specified number of digits
 * because float precision can be a problem
 * @param {float} num 
 * @param {int} digits 
 * @returns 
 */
function roundDigits(num, digits = 4) {
    console.log('roundDigits', num, digits);
    if (typeof num !== 'number') return num;
    return parseFloat(num.toFixed(digits));
}