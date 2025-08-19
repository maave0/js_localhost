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
async function callGetEndpoint(url, cors = true) {
    try {
        const fetchOptions = cors ? {} : { mode: 'no-cors' };
        const response = await fetch(url, fetchOptions);
        if (!response.ok && cors) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        // In no-cors mode, response type is opaque and cannot be read
        if (!cors && response.type === 'opaque') {
            return '[no-cors request sent, response is opaque]';
        }
        return await response.text();
    } catch (error) {
        addLogLine('Request to ' + url + ' failed: ' + error.message);
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

function addLogLine(line) {
    const div = document.createElement('div');
    div.className = 'log-line';
    div.innerHTML = escapeHTML(line);
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
}

document.addEventListener('DOMContentLoaded', eventListeners);
