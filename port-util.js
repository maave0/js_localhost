
const portsAndServices = [
  {
    port: 7071,
    protocol: 'http',
    service: 'Azure Function App (func start)',
    notes: 'Local Azure Function app running in VSCode. Example: `func start`.'
  },
  {
    port: 8384,
    protocol: 'http',
    service: 'Syncthing GUI',
    notes: 'No authentication, started by SyncTrayzor.'
  },
  {
    port: 58846,
    protocol: 'rpc',
    service: 'Deluge Daemon',
    notes: 'DelugeRPC, user localclient'
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
  }
];

// Calls checkPortResponseTime with the port from input and logs the result

/* with HTTP server running vs nothing running:

Port 7071 response: {"port":7071,"open":false,"timeMs":4.200000002980232}
Port 7071 response: {"port":7071,"open":false,"timeMs":3.2999999970197678}
Port 7071 response: {"port":7071,"open":false,"timeMs":3.4000000059604645}
Port 7071 response: {"port":7071,"open":false,"timeMs":2045.3999999910593}
Port 7071 response: {"port":7071,"open":false,"timeMs":2034.3999999910593}

*/
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
      ws.close();
      finish({ port: portNum, open: true, timeMs: elapsed });
    };

    ws.onerror = () => {
      const elapsed = performance.now() - start;
      finish({ port: portNum, open: false, timeMs: elapsed });
    };

    // Fallback timeout if no response
    setTimeout(() => {
      finish({ port: portNum, open: false, timeMs: performance.now() - start });
      try { ws.close(); } catch (e) {}
    }, timeoutMs);
  });
}