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
      roundedNum = roundDigits(elapsed);
      ws.close();
      finish({ port: portNum, webSocketOpen: true, timeMs: roundedNum });
    };

    ws.onerror = (event) => {
      const elapsed = performance.now() - start;
      roundedNum = roundDigits(elapsed);
      finish({ port: portNum, webSocketOpen: false, timeMs: roundedNum, errorMsg: JSON.stringify(event) });
    };

    // Fallback timeout if no response
    setTimeout(() => {
        const elapsed = performance.now() - start;
        roundedNum = roundDigits(elapsed);
        finish({ port: portNum, webSocketOpen: false, status:"timeout", timeMs: roundedNum });
        try { ws.close(); } catch (e) {}
    }, timeoutMs);
  });
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
    checkHttpResponse(+port)
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
    const roundedNum = roundDigits(elapsed);
    return Promise.resolve({ port: portNum, httpOpen: true, status: response.status, timeMs: roundedNum, result: result });
  } catch (error) {
    console.error("error\n"+error.message);
    const elapsed = performance.now() - start;
    const roundedNum = roundDigits(elapsed);
    return Promise.resolve({ port: portNum, httpOpen: false, status: "error", timeMs: roundedNum, errorMsg: error });
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