document.addEventListener('DOMContentLoaded', () => {
    const logList = document.getElementById('log-list');
    const bookmarkList = document.getElementById('bookmark-list'); // This needs to exist in the HTML
    const logButton = document.getElementById('log-button'); 
    const bookmarkButton = document.getElementById('bookmark-button');

    // Function to log the current tab's URL and favicon
    function logUrlAndFavicon() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url; 

            fetchFavicon(url).then(faviconUrl => {
                const listItem = document.createElement('li');
                listItem.classList.add('log-item');

                const urlPart = document.createElement('a');
                urlPart.classList.add('short-url');
                urlPart.href = url;
                urlPart.textContent = shortenUrl(url);
                urlPart.target = '_blank';
                urlPart.addEventListener('click', (e) => {
                    window.open(url, '_blank');
                });

                const faviconPart = document.createElement('img');
                faviconPart.classList.add('favicon-box');
                faviconPart.src = faviconUrl;
                faviconPart.style.width = '50px';
                faviconPart.style.height = '50px';
                faviconPart.style.objectFit = 'cover';

                const removeButton = document.createElement('span');
                removeButton.classList.add('remove-btn');
                removeButton.textContent = 'X';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeLog(listItem, url);
                });

                listItem.appendChild(urlPart);
                listItem.appendChild(faviconPart);
                listItem.appendChild(removeButton);

                logList.insertBefore(listItem, logList.firstChild);

                const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
                storedLogs.push({ url, faviconUrl });
                localStorage.setItem('logs', JSON.stringify(storedLogs));

                loadLogs();
            });
        });
    }

    function bookmarkUrlAndFavicon() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url;

            fetchFavicon(url).then(faviconUrl => {
                const listItem = document.createElement('li');
                listItem.classList.add('log-item');

                const urlPart = document.createElement('a');
                urlPart.classList.add('short-url');
                urlPart.href = url;
                urlPart.textContent = shortenUrl(url);
                urlPart.target = '_blank';
                urlPart.addEventListener('click', (e) => {
                    window.open(url, '_blank');
                });

                const faviconPart = document.createElement('img');
                faviconPart.classList.add('favicon-box');
                faviconPart.src = faviconUrl;
                faviconPart.style.width = '50px';
                faviconPart.style.height = '50px';
                faviconPart.style.objectFit = 'cover';

                const removeButton = document.createElement('span');
                removeButton.classList.add('remove-btn');
                removeButton.textContent = 'X';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeLog(listItem, url);
                });

                listItem.appendChild(urlPart);
                listItem.appendChild(faviconPart);
                listItem.appendChild(removeButton);

                // Ensure bookmarkList is defined before modifying it
                if (bookmarkList) {
                    bookmarkList.insertBefore(listItem, bookmarkList.firstChild); // Add to the top
                } else {
                    console.error("bookmarkList element is not found.");
                }

                const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
                storedBookmarks.push({ url, faviconUrl });
                localStorage.setItem('bookmarks', JSON.stringify(storedBookmarks));

                loadBookmarks();
            });
        });
    }

    function fetchFavicon(url) {
        return new Promise((resolve, reject) => {
            const parser = document.createElement('a');
            parser.href = url;

            const faviconUrl = `${parser.protocol}//${parser.host}/favicon.ico`;

            const img = new Image();
            img.onload = () => resolve(faviconUrl);
            img.onerror = () => resolve(getFallbackFavicon(url));
            img.src = faviconUrl;
        });
    }

    function getFallbackFavicon(url) {
        const firstLetter = new URL(url).hostname.charAt(0).toUpperCase();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.font = '30px Arial';
        ctx.fillText(firstLetter, 15, 35);
        return canvas.toDataURL();
    }

    function removeLog(listItem, url) {
        logList.removeChild(listItem);

        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        const updatedLogs = storedLogs.filter(logEntry => logEntry.url !== url);
        localStorage.setItem('logs', JSON.stringify(updatedLogs));
    }

    logButton.addEventListener('click', () => {
        logUrlAndFavicon();
        triggerConfetti(); // Trigger confetti when the log button is clicked
    });
    
    bookmarkButton.addEventListener('click', () => {
        bookmarkUrlAndFavicon();
    });

    loadLogs();
    loadBookmarks();

    function loadLogs() {
        logList.innerHTML = '';

        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        storedLogs.forEach((logEntry) => {
            const listItem = document.createElement('li');
            listItem.classList.add('log-item');

            const urlPart = document.createElement('a');
            urlPart.classList.add('short-url');
            urlPart.href = logEntry.url;
            urlPart.textContent = shortenUrl(logEntry.url);
            urlPart.target = '_blank';
            urlPart.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(logEntry.url, '_blank');
            });

            const faviconPart = document.createElement('img');
            faviconPart.classList.add('favicon-box');
            faviconPart.src = logEntry.faviconUrl;
            faviconPart.style.width = '20px';
            faviconPart.style.height = '20px';
            faviconPart.style.objectFit = 'cover';

            const removeButton = document.createElement('span');
            removeButton.classList.add('remove-btn');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                removeLog(listItem, logEntry.url);
            });

            listItem.appendChild(faviconPart);
            listItem.appendChild(urlPart);
            listItem.appendChild(removeButton);

            logList.insertBefore(listItem, logList.firstChild);
        });
    }

    function loadBookmarks() {
        if (bookmarkList) {  // Check if bookmarkList is defined
            bookmarkList.innerHTML = '';

            const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            storedBookmarks.forEach((bookmarkEntry) => {
                const listItem = document.createElement('li');
                listItem.classList.add('log-item');

                const urlPart = document.createElement('a');
                urlPart.classList.add('short-url');
                urlPart.href = bookmarkEntry.url;
                urlPart.textContent = shortenUrl(bookmarkEntry.url);
                urlPart.target = '_blank';
                urlPart.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.open(bookmarkEntry.url, '_blank');
                });

                const faviconPart = document.createElement('img');
                faviconPart.classList.add('favicon-box');
                faviconPart.src = bookmarkEntry.faviconUrl;
                faviconPart.style.width = '20px';
                faviconPart.style.height = '20px';
                faviconPart.style.objectFit = 'cover';

                const removeButton = document.createElement('span');
                removeButton.classList.add('remove-btn');
                removeButton.textContent = 'X';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeBookmark(listItem, bookmarkEntry.url);
                });

                listItem.appendChild(faviconPart);
                listItem.appendChild(urlPart);
                listItem.appendChild(removeButton);

                bookmarkList.insertBefore(listItem, bookmarkList.firstChild);
            });
        } else {
            console.error("bookmarkList element is not found.");
        }
    }

    function removeBookmark(listItem, url) {
        bookmarkList.removeChild(listItem);

        const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        const updatedBookmarks = storedBookmarks.filter(bookmarkEntry => bookmarkEntry.url !== url);
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    }

    function shortenUrl(url) {
        return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }


    // Function to trigger the confetti
    function triggerConfetti() {
        confetti({
            particleCount: 100, // Number of confetti particles
            spread: 70, // Spread angle
            origin: {
                x: 0.5, // Center the confetti
                y: 0.5
            }
        });
    }

});