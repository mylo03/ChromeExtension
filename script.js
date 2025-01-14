document.addEventListener('DOMContentLoaded', () => {
    const logList = document.getElementById('log-list');
    const selectButton = document.getElementById('select-button');
    const deleteButton = document.getElementById('delete-button');
    const logButton = document.getElementById('log-button'); // Ensure the plus button is linked here
    let isSelecting = false;

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
            datePart.textContent = formatDate(date); // Ensure you have this function to format the date

            // Append URL and date to the list item
            listItem.appendChild(urlPart);
            listItem.appendChild(datePart);

            // Append the log item to the list
            logList.insertBefore(listItem, logList.firstChild); // Insert at the top (descending order)

            // Save the log entry in localStorage
            const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
            storedLogs.unshift({ url, date }); // Add new log entry at the beginning
            localStorage.setItem('logs', JSON.stringify(storedLogs));
        });
    }

    function shortenUrl(url) {
        const maxLength = 20; // Set a maximum length for the shortened URL
        if (url.length > maxLength) {
            return url.substring(0, maxLength) + '...'; // Add ellipsis if it's too long
        }
        return url;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Function to load logs from localStorage and display them
    function loadLogs() {
        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        storedLogs.forEach((logEntry, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('log-item');
            listItem.dataset.index = index;

            // URL part
            const urlPart = document.createElement('a');
            urlPart.classList.add('short-url');
            urlPart.href = logEntry.url;
            urlPart.textContent = shortenUrl(logEntry.url);
            urlPart.target = '_blank';  // Open in a new tab when clicked

            // Date part
            const datePart = document.createElement('span');
            datePart.classList.add('date-box');
            datePart.textContent = formatDate(logEntry.date);

            // Append URL and date to the list item
            listItem.appendChild(urlPart);
            listItem.appendChild(datePart);

            // Handle selection logic
            listItem.addEventListener('click', () => {
                if (isSelecting) {
                    listItem.classList.toggle('selected');
                    toggleDeleteButtonVisibility();
                }
            });

            logList.appendChild(listItem);
        });
    }

    // Function to toggle visibility of the delete button
    function toggleDeleteButtonVisibility() {
        const selectedItems = document.querySelectorAll('.selected');
        if (selectedItems.length > 0) {
            deleteButton.style.display = 'block';
        } else {
            deleteButton.style.display = 'none';
        }
    }

    // Function to delete selected logs
    function deleteSelectedLogs() {
        const selectedItems = document.querySelectorAll('.selected');
        const selectedIndexes = Array.from(selectedItems).map(item => item.dataset.index);

        // Filter out selected logs from storedLogs
        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        const updatedLogs = storedLogs.filter((_, index) => !selectedIndexes.includes(index.toString()));

        // Save the updated logs to localStorage
        localStorage.setItem('logs', JSON.stringify(updatedLogs));

        // Reload logs after deletion
        logList.innerHTML = '';
        loadLogs();
    }

    // Handle select button click
    selectButton.addEventListener('click', () => {
        isSelecting = !isSelecting;
        selectButton.textContent = isSelecting ? 'Cancel Selection' : 'Select';
    });

    // Handle delete button click
    deleteButton.addEventListener('click', deleteSelectedLogs);

    // Handle log button click (the plus button)
    logButton.addEventListener('click', logUrlAndDate);

    // Load logs on page load
    loadLogs();
});