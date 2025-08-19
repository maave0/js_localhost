function getPreview(str, maxLen = 100) {
    if (typeof str !== 'string') return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

// Azure Function App / dotnet running locally with `func start`
// will be blocked in the browser by CORS:  net::ERR_FAILED 200 (OK)
// if CORS is allowed with `func host start --cors *` you get a 200 response and everything
function getHeartbeat() {
    callGetEndpoint('http://localhost:7071/api/heartbeat')
        .then(result => {
            addLogLine('GET /api/heartbeat success: ' + getPreview(result));
        })
        .catch(error => {
            addLogLine('GET /api/heartbeat error: ' + error.message);
        });

    callGetEndpoint('http://127.0.0.1:7071/api/heartbeat')
        .then(result => {
            addLogLine('GET /api/heartbeat success: ' + getPreview(result));
        })
        .catch(error => {
            addLogLine('GET /api/heartbeat error: ' + error.message);
    });
}
// Function to GET google.com using callGetEndpoint, will fail due to CORS
function getGoogle() {
    callGetEndpoint('https://www.google.com')
        .then(result => {
            addLogLine('GET google.com success: ' + getPreview(result));
        })
        .catch(error => {
            addLogLine('GET google.com error: ' + error.message);
        });
}

// Function to call a GET endpoint with a given URL
async function callGetEndpoint(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        return await response.text();
    } catch (error) {
        addLogLine('Request to ' + url + ' failed: ' + error.message);
        
        throw error;
    }
}

const logContainer = document.getElementById('log-container');

function escapeHTML(str) {
    return str.replace(/[&<>'"`=\/]/g, function (s) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;',
            '`': '&#96;',
            '=': '&#61;',
            '/': '&#47;'
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
    const addLogsBtn = document.getElementById('add-logs-btn');
    if (addLogsBtn) {
        addLogsBtn.addEventListener('click', testAddingText);
    }
    const getGoogleBtn = document.getElementById('get-google-btn');
    if (getGoogleBtn) {
        getGoogleBtn.addEventListener('click', getGoogle);
    }
    const getHeartbeatBtn = document.getElementById('get-heartbeat-btn');
    if (getHeartbeatBtn) {
        getHeartbeatBtn.addEventListener('click', getHeartbeat);
    }
}

document.addEventListener('DOMContentLoaded', eventListeners);
