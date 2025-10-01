var localAddress = "127.0.0.1";

// Calls checkPortResponseTime with the port from input and logs the result
function checkPort() {
    const portInput = document.getElementById('port-input');
    // validation
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
  console.log("checking websocket");
  return new Promise((resolve) => {
    const start = performance.now();
  const ws = new WebSocket(`ws://${localAddress}:${portNum}`);
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
      roundedResponseTime = roundDigits(elapsed);
      ws.close();
      finish({ port: portNum, webSocketOpen: true, timeMs: roundedResponseTime });
    };

    ws.onerror = (event) => {
      const elapsed = performance.now() - start;
      roundedResponseTime = roundDigits(elapsed);
      finish({ port: portNum, webSocketOpen: false, timeMs: roundedResponseTime, errorMsg: JSON.stringify(event) });
    };

    // Fallback timeout if no response
    setTimeout(() => {
        const elapsed = performance.now() - start;
        roundedResponseTime = roundDigits(elapsed);
        finish({ port: portNum, webSocketOpen: false, status:"timeout", timeMs: roundedResponseTime });
        try { ws.close(); } catch (e) {}
    }, timeoutMs);
  });
}


async function scanPorts() {
  // if the port replies faster than this, it's probably open
  const instantResponseMs = 30;
  const fastResponseMs = 200;
  const slowResponseMs = 900;
  const likelyOpenPorts = [];

  let responseTimes = {};
  let avgResponseTime = 0;

  if (typeof portsAndServices === 'undefined') {
    addLogLine('portsAndServices is not defined.');
    return;
  }
  // Get unique port numbers
  const uniquePorts = Array.from(new Set(
    portsAndServices
      .map(svc => Array.isArray(svc.ports) ? svc.ports : [svc.port])
      .flat()
      .filter(port => typeof port === 'number' && !isNaN(port))
  ));

  addLogLine('Scanning ports: ' + uniquePorts.join(', '));

  for (const portNum of uniquePorts) {
    try {
      // check and log response time
      const result = await checkPortResponseTime(portNum);
      addLogLine(`Port ${portNum} timeMs: ${result.timeMs}`);
      responseTimes[portNum] = result.timeMs;
    } catch (err) {
      addLogLine(`Port ${portNum} error: ${err && err.message ? err.message : err}`);
    }
  }

  // avg response time
  const totalResponseTime = Object.values(responseTimes).reduce( (sum, time) => sum+time, 0 );
  avgResponseTime = totalResponseTime / Object.values(responseTimes).length;
  addLogLine(`Average response time: ${avgResponseTime.toFixed(1)} ms`);

  // sanity check. If all null responses are fast, profiling won't work
  if (Object.values(responseTimes).every(t => t <= instantResponseMs)) {
    addLogLine('All response times below ' + instantResponseMs + ' ms, cannot determine open ports reliably.');
    return [];
  }
  
  for (const [portNum, timeMs] of Object.entries(responseTimes)) {
    if (timeMs <= fastResponseMs) {
      likelyOpenPorts.push(Number(portNum));
    }
  }

  // output
  // Map likely open ports to possible service names using portToServiceNames
  let openPortServices = [];
  for (const portNum of likelyOpenPorts) {
    const serviceNames = portToServiceNames(portNum);
    openPortServices.push({
      port: portNum,
      services: serviceNames.length ? serviceNames : ['Unknown']
    });
  }

  if (openPortServices.length) {
    addLogLine('Likely open ports and possible services:');
    openPortServices.forEach(entry => {
      addLogLine(`Port ${entry.port}: ${entry.services.join('; ')}`);
    });
  } else {
    addLogLine('None detected below threshold');
  }

  return openPortServices;

}

/**
 * Returns an array of possible service names for a given port number
 * @param {number} portNum
 * @returns {string[]}
 */
function portToServiceNames(portNum) {
  if (typeof portsAndServices === 'undefined') return [];
  const matches = portsAndServices.filter(svc => {
    if (Array.isArray(svc.ports)) {
      return svc.ports.includes(portNum);
    } else {
      return svc.port === portNum;
    }
  });
  return matches.map(m => m.service);
}

function checkHttpPort() {
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
    if (typeof checkHttpResponse !== 'function') {
        addLogLine('checkHttpResponse() is not defined.');
        return;
    }
    addLogLine('Checking port: ' + escapeHTML(port));
    checkHttpResponse(port)
        .then(result => {
            addLogLine('Port ' + port + ' response: ' + JSON.stringify(result));
        })
        .catch(err => {
            addLogLine('Port ' + port + ' error: ' + (err && err.message ? err.message : err));
        });
}

/**
 * attempt connection using HTTP fetch
 * subject to CORS
 * @param {int} portNum 
 * @returns Promise
 */
async function checkHttpResponse(portNum) {
  console.log("checking http");
  var url = `http://${localAddress}:${portNum}/`;
  
  const start = performance.now();
  const timeoutMs = 10 * 1000;
  try {
    const response = await fetch(url, {
      method: "GET",
      mode: "no-cors"
    });
    if (!response.ok) {
      throw new Error(`Response status: ${JSON.stringify(response)}`);
    }
    const result = await response.json();
    console.log(result);
    const elapsed = performance.now() - start;
    const roundedResponseTime = roundDigits(elapsed);
    return Promise.resolve({ port: portNum, httpOpen: true, status: response.status, timeMs: roundedResponseTime, result: result });
  } catch (error) {
    console.error("error\n"+error.message);
    const elapsed = performance.now() - start;
    const roundedResponseTime = roundDigits(elapsed);
    return Promise.resolve({ port: portNum, httpOpen: false, status: "error", timeMs: roundedResponseTime, errorMsg: error });
  }

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