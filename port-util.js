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

/**
 * 
 * @param {boolean} dryRun - uses fixed values for ports/responseTimes
 * @returns ports of interest
 */
async function scanPorts(dryRun=false) {
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

  // TODO: split function into "scan ports" and "analyze results" for ease of testing
  if(dryRun) {
    addLogLine('Testing');
    // hard-code response times so we can test analysis functions
    responseTimes = {
      1: 2000,
      2: 2036,
      3: 2050.2,
      4: 2064.3,
      5: 2068.4,
      6: 2063.4,
      7: 2083.8,
      8: 2077.3,
      9: 2116.8,
      10: 2097.7,
      11: 2252.9,
      12: 2672.9,
      13: 2810.2,
      14: 4322.6,
      15: 4654.5,
      16: 5557.9,
      17: 3058.3,
      18: 4951.9,
      19: 1,
    }
  } else {
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
  }

  // avg response time
  const totalResponseTime = Object.values(responseTimes).reduce( (sum, time) => sum+time, 0 );
  avgResponseTime = totalResponseTime / Object.values(responseTimes).length;
  addLogLine(`Average response time: ${avgResponseTime.toFixed(1)} ms`);
  addLogLine(`Filtering outliers ...`);

  // filter outliers
  filteredResponseTimes = filterOutliers( Object.values(responseTimes) );
  let difference = Object.values(responseTimes).filter(x => !filteredResponseTimes.includes(x));
  addLogLine(`Removed ${difference.length} outlier${difference.length==1?'':'s'}`);
  if(difference.length) {
    addLogLine(`Removed ${difference.join(", ")}`)
  }
  
  // display avg sans outliers
  filtTotalRespTime = filteredResponseTimes.reduce( (sum, time) => sum+time, 0 );
  filtAvgRespTime = filtTotalRespTime / filteredResponseTimes.length;
  addLogLine(`After filtering outliers, avg response time: ${filtAvgRespTime.toFixed(1)} ms`);

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

/**
 * remove statistical outliers from int array
 * @param {array} someArray 
 * @returns modified array
 */
function filterOutliers(collection) {
    const size = collection.length;
    let q1, q3;

    // min size for math to work
    if (size < 2) {
        return collection;
    }

    // slice() to copy array, then sort
    const sortedCollection = collection.slice().sort((a, b) => a - b);

    // find q1 and q3
    if ((size - 1) / 4 % 1 === 0 || size / 4 % 1 === 0) {
      q1 = 1 / 2 * (sortedCollection[Math.floor(size / 4) - 1] + sortedCollection[Math.floor(size / 4)]);
      q3 = 1 / 2 * (sortedCollection[Math.ceil(size * 3 / 4) - 1] + sortedCollection[Math.ceil(size * 3 / 4)]);
    } else {
      // if our set size is cleanly divisible by 4, then average the two elements on either side to find q1
      q1 = sortedCollection[Math.floor(size / 4)];
      q3 = sortedCollection[Math.floor(size * 3 / 4)];
    }

    // inter-quartile range
    const iqr = q3 - q1;
    // what counts as an outlier
    const maxValue = q3 + iqr * 1.5;
    const minValue = q1 - iqr * 1.5;

    return sortedCollection.filter(x => (x >= minValue) && (x <= maxValue));
}