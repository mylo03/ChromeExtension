document.addEventListener('DOMContentLoaded', () => {
    const logList = document.getElementById('log-list');
    const logButton = document.getElementById('log-button'); // Ensure the plus button is linked here

    // Function to log the current tab's URL and date
    function logUrlAndDate() {
        // Get the active tab's URL using the Chrome API
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url; // Get the URL of the active tab
            const date = new Date().toISOString();
            
            // Create the log entry and append to the list
            const listItem = document.createElement('li');
            listItem.classList.add('log-item');

            // URL part
            const urlPart = document.createElement('a');
            urlPart.classList.add('short-url');
            urlPart.href = url;
            urlPart.textContent = shortenUrl(url); // Ensure you have this function to shorten URL
            urlPart.target = '_blank';  // Open in a new tab when clicked
            urlPart.addEventListener('click', (e) => {
                // Open URL in a new tab
                window.open(url, '_blank');
            });

            // Date part
            const datePart = document.createElement('span');
            datePart.classList.add('date-box');
            datePart.textContent = formatDate(date);

            // Remove button (X icon)
            const removeButton = document.createElement('span');
            removeButton.classList.add('remove-btn');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the URL from opening when X is clicked
                removeLog(listItem, url);
            });

            // Append URL, date, and remove button to the list item
            listItem.appendChild(urlPart);
            listItem.appendChild(datePart);
            listItem.appendChild(removeButton);
            
            logList.insertBefore(listItem, logList.firstChild); // Add to the top

            // Save the log entry in localStorage
            const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
            storedLogs.push({ url, date });
            localStorage.setItem('logs', JSON.stringify(storedLogs));

            // Reload the logs after saving
            loadLogs();
        });
    }

    // Function to remove log from the list and localStorage
    function removeLog(listItem, url) {
        // Remove from DOM
        logList.removeChild(listItem);

        // Remove from localStorage
        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        const updatedLogs = storedLogs.filter(logEntry => logEntry.url !== url);
        localStorage.setItem('logs', JSON.stringify(updatedLogs));
    }

    // Handle the plus button click to log URL and date
    logButton.addEventListener('click', logUrlAndDate);

    // Load logs on page load
    loadLogs();

    // Function to load logs from localStorage and display them
    function loadLogs() {
        // Clear existing list before adding new logs
        logList.innerHTML = '';
    
        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        storedLogs.forEach((logEntry) => {
            const listItem = document.createElement('li');
            listItem.classList.add('log-item');
    
            // URL part
            const urlPart = document.createElement('a');
            urlPart.classList.add('short-url');
            urlPart.href = logEntry.url;
            urlPart.textContent = shortenUrl(logEntry.url);
            urlPart.target = '_blank';
            urlPart.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(logEntry.url, '_blank');
            });
    
            // Date part
            const datePart = document.createElement('span');
            datePart.classList.add('date-box');
            datePart.textContent = formatDate(logEntry.date);
    
            // Remove button (X icon)
            const removeButton = document.createElement('span');
            removeButton.classList.add('remove-btn');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the URL from opening when X is clicked
                removeLog(listItem, logEntry.url);
            });
    
            // Append URL, date, and remove button to the list item
            listItem.appendChild(urlPart);
            listItem.appendChild(datePart);
            listItem.appendChild(removeButton);
    
            logList.insertBefore(listItem, logList.firstChild); // Insert at the top
        });
    }

    // Function to shorten the URL for display purposes
    function shortenUrl(url) {
        return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }

    // Function to format the date (e.g., "Jan 4" or "Feb 5")
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
});