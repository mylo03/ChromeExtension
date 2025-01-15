document.addEventListener('DOMContentLoaded', () => {
    const logList = document.getElementById('log-list');
    const logButton = document.getElementById('log-button'); // Ensure the plus button is linked here

    // Function to log the current tab's URL and favicon
    function logUrlAndFavicon() {
        // Get the active tab's URL using the Chrome API
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url; // Get the URL of the active tab

            // Fetch favicon from the webpage
            fetchFavicon(url).then(faviconUrl => {
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

                // Favicon part
                const faviconPart = document.createElement('img');
                faviconPart.classList.add('favicon-box');
                faviconPart.src = faviconUrl; // Set the favicon image
                faviconPart.style.width = '50px'; // Set the width to 50px
                faviconPart.style.height = '50px'; // Set the height to 50px
                faviconPart.style.objectFit = 'cover'; // Ensure the image fits inside the box

                // Remove button (X icon)
                const removeButton = document.createElement('span');
                removeButton.classList.add('remove-btn');
                removeButton.textContent = 'X';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent the URL from opening when X is clicked
                    removeLog(listItem, url);
                });

                // Append URL, favicon, and remove button to the list item
                listItem.appendChild(urlPart);
                listItem.appendChild(faviconPart);
                listItem.appendChild(removeButton);

                logList.insertBefore(listItem, logList.firstChild); // Add to the top

                // Save the log entry in localStorage
                const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
                storedLogs.push({ url, faviconUrl });
                localStorage.setItem('logs', JSON.stringify(storedLogs));

                // Reload the logs after saving
                loadLogs();
            });
        });
    }

    // Function to fetch the favicon URL from the tab's URL
    function fetchFavicon(url) {
        return new Promise((resolve, reject) => {
            const parser = document.createElement('a');
            parser.href = url;

            // Try using the standard favicon path
            const faviconUrl = `${parser.protocol}//${parser.host}/favicon.ico`;

            // Test if the favicon exists by creating an image element and checking its load status
            const img = new Image();
            img.onload = () => resolve(faviconUrl); // If the image loads successfully, resolve the URL
            img.onerror = () => resolve(getFallbackFavicon(url)); // Fallback to first letter if error
            img.src = faviconUrl; // Set the favicon image source
        });
    }

    // Function to generate a fallback favicon (first letter of the URL)
    function getFallbackFavicon(url) {
        const firstLetter = new URL(url).hostname.charAt(0).toUpperCase();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        ctx.fillStyle = '#ccc'; // Set a background color for fallback
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000'; // Set text color
        ctx.font = '30px Arial'; // Set font size and type
        ctx.fillText(firstLetter, 15, 35); // Draw the first letter in the center
        return canvas.toDataURL(); // Return the image as a data URL
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

    // Handle the plus button click to log URL and favicon
    logButton.addEventListener('click', logUrlAndFavicon);

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

            // Favicon part
            const faviconPart = document.createElement('img');
            faviconPart.classList.add('favicon-box');
            faviconPart.src = logEntry.faviconUrl; // Set the favicon image
            faviconPart.style.width = '20px'; // Ensure it's 50x50
            faviconPart.style.height = '20px'; // Ensure it's 50x50
            faviconPart.style.objectFit = 'cover'; // Fit the image inside the box

            // Remove button (X icon)
            const removeButton = document.createElement('span');
            removeButton.classList.add('remove-btn');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the URL from opening when X is clicked
                removeLog(listItem, logEntry.url);
            });

            // Append URL, favicon, and remove button to the list item
            listItem.appendChild(faviconPart);
            listItem.appendChild(urlPart);
            listItem.appendChild(removeButton);

            logList.insertBefore(listItem, logList.firstChild); // Insert at the top
        });
    }

    // Function to shorten the URL for display purposes
    function shortenUrl(url) {
        return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
});