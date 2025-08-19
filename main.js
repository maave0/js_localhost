
const logContainer = document.getElementById('log-container');

function addLogLine(line) {
    const div = document.createElement('div');
    div.className = 'log-line';
    div.textContent = line;
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
    let runs = 10;
    while (runs > 0) {
        logs.forEach(addLogLine);
        runs--;
    }
}

// Add event listener for the button
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('add-logs-btn');
    if (btn) {
        btn.addEventListener('click', testAddingText);
    }
});


