document.addEventListener('DOMContentLoaded', () => {
    const logList = document.getElementById('log-list');
    const logButton = document.getElementById('log-button');

    // Function to load saved logs from localStorage
    function loadLogs() {
        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        storedLogs.forEach(logEntry => {
            const listItem = document.createElement('li');
            listItem.textContent = logEntry;
            logList.appendChild(listItem);
        });
    }

    // Function to log the current URL and date
    function logUrlAndDate() {
        const url = window.location.href;
        const date = new Date().toISOString();
        const logEntry = `URL: ${url}, Date: ${date}`;
        
        // Append the log entry to the list
        const listItem = document.createElement('li');
        listItem.textContent = logEntry;
        logList.appendChild(listItem);

        // Save the log entry in localStorage
        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        storedLogs.push(logEntry);
        localStorage.setItem('logs', JSON.stringify(storedLogs));
    }

    // Add event listener to the "+" button
    if (logButton) {
        logButton.addEventListener('click', logUrlAndDate);
    } else {
        console.error("Element with id 'log-button' not found.");
    }

    // Load logs on page load
    loadLogs();
});