
const logContainer = document.getElementById('log-container');

function addLogLine(line) {
    const div = document.createElement('div');
    div.className = 'log-line';
    div.textContent = line;
    logContainer.appendChild(div);
}

// Example log lines
const logs = [
    'Server started on port 8080',
    'User connected: 192.168.1.10',
    'Received request: /api/data',
    'Error: Invalid input',
    'User disconnected: 192.168.1.10'
];
logs.forEach(addLogLine);
