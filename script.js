document.addEventListener('DOMContentLoaded', () => {
    const logButton = document.getElementById('log-button');
    const logList = document.getElementById('log-list');

    // Function to load saved logs from localStorage
    function loadLogs() {
        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        storedLogs.forEach(logEntry => {
            const listItem = document.createElement('li');
            listItem.textContent = `URL: ${logEntry.url}, Date: ${logEntry.date}`;
            logList.appendChild(listItem);
        });
    }

    // Function to log the current tab's URL and date
    function logUrlAndDate() {
        // Get the active tab's URL using the Chrome API
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url; // Get the URL of the active tab
            const date = new Date().toISOString();

            // Create the log entry and append to the list
            const listItem = document.createElement('li');
            listItem.textContent = `URL: ${url}, Date: ${date}`;
            logList.appendChild(listItem);

            // Save the log entry in localStorage
            const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
            storedLogs.push({ url, date });
            localStorage.setItem('logs', JSON.stringify(storedLogs));
        });
    }

    // Add event listener to the "+" button
    if (logButton) {
        logButton.addEventListener('click', logUrlAndDate);
    } else {
        console.error("Element with id 'log-button' not found.");
    }

    // Load the saved logs on page load
    loadLogs();
});