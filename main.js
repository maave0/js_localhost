// Calls samples.js oligoXhrSample() and logs the result or error
function getOligoXHR() {
    if (typeof oligoXhrSample !== 'function') {
        addLogLine('oligoXhrSample() is not defined.');
        return;
    }
    oligoXhrSample()
        .then(result => {
            addLogLine('oligo XHR success: ' + getPreview(result));
        })
        .catch(err => {
            addLogLine('oligo XHR error: ' + (err && err.message ? err.message : err));
        });
}
// Calls samples.js xhrSample() and logs the result or error
function getSampleAPI_XHR() {
    console.log('Starting XHR Sample');
    if (typeof xhrSample !== 'function') {
        addLogLine('xhrSample() is not defined.');
        return;
    }
    try {
        xhrSample(function(err, result) {
            if (err) {
                addLogLine('XHR Sample error: ' + err);
            } else {
                addLogLine('XHR Sample success: ' + getPreview(result));
            }
        });
    } catch (e) {
        addLogLine('XHR Sample exception: ' + e.message);
    }
}

function getAPIUrl(cors = true) {
    const input = document.getElementById('api-url-input');
    if (!input) {
        addLogLine('API URL input not found.');
        return;
    }
    const url = input.value.trim();
    if (!url) {
        addLogLine('Please enter a URL.');
        return;
    }
    let valid = false;
    try {
        // Accepts http(s):// and protocol-relative URLs
        const u = new URL(url, window.location.origin);
        valid = u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) {
        valid = false;
    }
    if (!valid) {
        addLogLine('Invalid URL: ' + escapeHTML(url));
        return;
    }
    callGetEndpoint(url, cors)
        .then(result => {
            addLogLine('GET ' + escapeHTML(url) + ' success: ' + getPreview(result));
        })
        .catch(error => {
            addLogLine('GET ' + escapeHTML(url) + ' error: ' + error.message);
        });
}

function getPreview(str, maxLen = 100) {
    if (typeof str !== 'string') return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

// Azure Function App / dotnet running locally with `func start`
// the request will be blocked in the browser by CORS:  net::ERR_FAILED 200 (OK)
// if CORS is allowed with `func host start --cors *` you get a 200 response and everything
// if function is called with cors=false the request will continue regardless of CORS but you won't see the response (opaque)
function getHeartbeat(cors = true) {
    let endpoint1 = 'http://localhost:7071/api/heartbeat';
    callGetEndpoint(endpoint1, cors)
        .then(result => {
            addLogLine('GET ' + endpoint1 + ' success: ' + getPreview(result));
        })
        .catch(error => {
            addLogLine('GET ' + endpoint1 + ' error: ' + error.message);
        });

    let endpoint2 = 'http://127.0.0.1:7071/api/heartbeat';
    callGetEndpoint(endpoint2, cors)
        .then(result => {
            addLogLine('GET ' + endpoint2 + ' success: ' + getPreview(result));
        })
        .catch(error => {
            addLogLine('GET ' + endpoint2 + ' error: ' + error.message);
    });
}
// Function to GET icanhazip.com using callGetEndpoint
function getSampleAPI() {
    callGetEndpoint('https://icanhazip.com')
        .then(result => {
            addLogLine('GET icanhazip.com success: ' + getPreview(result));
        })
        .catch(error => {
            addLogLine('GET icanhazip.com error: ' + error.message);
        });
}

// Function to call a GET endpoint with a given URL
// subject to cors, responds in about 2000 ms
async function callGetEndpoint(url, cors = true) {
    
    const start = performance.now();
    try {
        const fetchOptions = cors ? {} : { mode: 'no-cors' };
        const response = await fetch(url, fetchOptions);
        // response time
        const elapsed = performance.now() - start;
        const roundedResponseTime = roundDigits(elapsed); //response time
        //const responsebody = { port: portNum, status: response, timeMs: roundedResponseTime, result: result };
        if (!response.ok && cors) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        // In no-cors mode, response type is opaque and cannot be read
        if (!cors && response.type === 'opaque') {
            return '[no-cors request sent, response is opaque]';
        }
        return response;
    } catch (error) {
        const elapsed = performance.now() - start;
        const roundedResponseTime = roundDigits(elapsed);
        addLogLine('Request to ' + url + ' failed: ' + error.message);
        addLogLine('Response time (ms): ' + roundedResponseTime);
        throw error;
    }
}

const logContainer = document.getElementById('log-container');

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, function (s) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        })[s];
    });
}

function toggleLogLine(){
    const contentSpan = this.nextSibling;
    if (contentSpan.style.display === 'none') {
        contentSpan.style.display = 'inline';
        this.textContent = '▼ ';
    } else {
        contentSpan.style.display = 'none';
        this.textContent = '▶ ' + contentSpan.textContent.substring(0, 20) + '...';
    }
}

function addLogLine(line, collapsed = false) {
    const div = document.createElement('div');
    div.className = 'log-line';

    if (collapsed) {
        console.log("adding collapsed log line");
        const revealArrow = document.createElement('span');
        revealArrow.textContent = '▶ ' + line.substring(0, 20) + '...';
        revealArrow.style.cursor = 'pointer';
        revealArrow.style.userSelect = 'none';
        div.appendChild(revealArrow);
        const contentSpan = document.createElement('span');
        contentSpan.style.display = 'none';
        contentSpan.innerHTML = escapeHTML(line);
        div.appendChild(contentSpan);
        // js onclick to toggle
        revealArrow.onclick = toggleLogLine;
    }
    else {    
        div.innerHTML = escapeHTML(line);
    }
    logContainer.appendChild(div);

    logContainer.scrollTop = logContainer.scrollHeight;
}

// Example log lines
const logs = [
    'Server started on port 8080',
    'User connected: 192.168.1.10',
    'Received request: /api/data',
    'Error: Invalid input',
    'User disconnected: 192.168.1.10'
];
function testAddingText() {
    let runs = 2;
    while (runs > 0) {
        logs.forEach(addLogLine);
        runs--;
    }
}

// Add event listener for the button
function eventListeners() {
    console.log("adding event listeners");

    const checkPortBtn = document.getElementById('check-port-btn');
    if (checkPortBtn) {
        checkPortBtn.addEventListener('click', checkPort);
    }

    const scanPortsBtn = document.getElementById('scan-ports-btn');
    if (scanPortsBtn) {
        scanPortsBtn.addEventListener('click', scanPorts);
    }

    const checkHttpBtn = document.getElementById('check-http-btn');
    if (checkPortBtn) {
        checkHttpBtn.addEventListener('click', checkHttpPort);
    }

    const oligoXHRBtn = document.getElementById('oligo-xhr-btn');
    if (oligoXHRBtn) {
        oligoXHRBtn.addEventListener('click', getOligoXHR);
    }

    const getGoogleXHRBtn = document.getElementById('get-google-xhr-btn');
    if (getGoogleXHRBtn) {
        getGoogleXHRBtn.addEventListener('click', getSampleAPI_XHR);
    }
    const addLogsBtn = document.getElementById('add-logs-btn');
    if (addLogsBtn) {
        addLogsBtn.addEventListener('click', testAddingText);
    }
    const getGoogleBtn = document.getElementById('get-google-btn');
    if (getGoogleBtn) {
        getGoogleBtn.addEventListener('click', getSampleAPI);
    }
    const getHeartbeatBtn = document.getElementById('get-heartbeat-btn');
    if (getHeartbeatBtn) {
        getHeartbeatBtn.addEventListener('click', getHeartbeat);
    }
    const getAPIUrlBtn = document.getElementById('get-api-url-btn');
    if (getAPIUrlBtn) {
        getAPIUrlBtn.addEventListener('click', getAPIUrl);
    }

    const noCORSBtn = document.getElementById('no-cors-btn');
    if (noCORSBtn) {
        noCORSBtn.addEventListener('click', function() { getAPIUrl(false); });
    }

    // log to user "console ready"
    addLogLine('Console ready.');
}

function fingerprint() {

    // user agent
    console.log("checking user agent");
    const parser = new UAParser();
    const result = parser.getResult();
    console.log(""+JSON.stringify(result));

    addLogLine("Browser: "+ result.browser.name + " " + result.browser.version);
    addLogLine("OS: "+ result.os.name);
    

    // navigator
    console.log(navigator);
    // copy object that can't be JSON strigified
    var _navigator = {};
    for (var i in navigator) _navigator[i] = navigator[i];
    // remove deprecated
    delete _navigator.plugins;
    delete _navigator.mimeTypes;
    // remove null and empty {}
    for (var key in _navigator) {
        if (_navigator[key] === null) {
            delete _navigator[key];
        } else if (typeof _navigator[key] === 'object' && Object.keys(_navigator[key]).length === 0) {
            delete _navigator[key];
        }
    }
    addLogLine("nav: "+ JSON.stringify(_navigator), collapsed=true);


    // webgl
    console.log("checking webgl");
    const canvas = document.getElementById("webgl-canvas");
    const gl = canvas.getContext("webgl");
    var webglInfo = {
        version: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
    };
    addLogLine("webgl: "+ JSON.stringify(webglInfo), collapsed=true);
    //console.log("checked webgl");

}

document.addEventListener('DOMContentLoaded', eventListeners);
document.addEventListener('DOMContentLoaded', fingerprint);
