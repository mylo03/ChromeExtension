import * as pdfjsLib from './libs/pdf.mjs'; 
import { initializeCVUploadHandlers } from './Scripts/cvUploadHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('./libs/pdf.worker.mjs');

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
                listItem.dataset.url = url;
                listItem.classList.add('log-item');

                const urlPart = document.createElement('a');
                urlPart.classList.add('short-url');
                urlPart.href = url;
                urlPart.textContent = shortenUrl(url);
                urlPart.target = '_blank';

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
                makeDraggable(listItem); // Ensure newly added item is draggable
            });
        });
    }

    function bookmarkUrlAndFavicon() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url;

            fetchFavicon(url).then(faviconUrl => {
                const listItem = document.createElement('li');
                listItem.dataset.url = url;
                listItem.classList.add('log-item');

                const urlPart = document.createElement('a');
                urlPart.classList.add('short-url');
                urlPart.href = url;
                urlPart.textContent = shortenUrl(url);
                urlPart.target = '_blank';

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

                if (bookmarkList) {
                    bookmarkList.insertBefore(listItem, bookmarkList.firstChild); // Add to the top
                    makeDraggable(listItem); // Ensure newly added item is draggable
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

    logButton.addEventListener('click', async () => {
        logUrlAndFavicon();
        triggerConfetti(); // Trigger confetti when the log button is clicked
    
        // Wait for the next event loop cycle to ensure other operations are completed
        await new Promise(resolve => setTimeout(resolve, 1));
        updateLogItemsDarkMode();
    });


    
    bookmarkButton.addEventListener('click', async () => {
        bookmarkUrlAndFavicon();
        await new Promise(resolve => setTimeout(resolve, 1));
        updateLogItemsDarkMode();
    });

    loadLogs();
    loadBookmarks();

    function loadLogs() {
        logList.innerHTML = '';

        const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
        storedLogs.forEach((logEntry) => {
            const listItem = document.createElement('li');
            listItem.dataset.url = logEntry.url;
            listItem.classList.add('log-item');

            const urlPart = document.createElement('a');
            urlPart.classList.add('short-url');
            urlPart.href = logEntry.url;
            urlPart.textContent = shortenUrl(logEntry.url);
            urlPart.target = '_blank';

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
            makeDraggable(listItem); // Ensure loaded items are draggable
        });
    }

    function loadBookmarks() {
        if (bookmarkList) {
            bookmarkList.innerHTML = '';

            const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            storedBookmarks.forEach((bookmarkEntry) => {
                const listItem = document.createElement('li');
                listItem.dataset.url = bookmarkEntry.url;
                listItem.classList.add('log-item');

                const urlPart = document.createElement('a');
                urlPart.classList.add('short-url');
                urlPart.href = bookmarkEntry.url;
                urlPart.textContent = shortenUrl(bookmarkEntry.url);
                urlPart.target = '_blank';

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
                makeDraggable(listItem); // Ensure loaded items are draggable
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


    // Allow items to be draggable
    function makeDraggable(item) {
        item.draggable = true;
        item.addEventListener('dragstart', handleDragStart);
    }


    // Handle the start of a drag
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.url); // Store the URL of the dragged item
        e.dataTransfer.setData('source', e.target.parentNode.id);  // Store the source list's ID
        e.target.classList.add('dragging');
    }

    // Allow dropping by preventing default
    function handleDragOver(e) {
        e.preventDefault();
    }

    // Handle the drop event
    function handleDrop(e) {
        e.preventDefault();
        const url = e.dataTransfer.getData('text/plain');
        const source = e.dataTransfer.getData('source');
        const targetList = e.target.closest('ul');
    
        if (targetList && targetList.id !== source) {
            // Find and remove the dragged item from the source list
            const sourceList = document.getElementById(source);
            const draggedItem = [...sourceList.children].find(
                (child) => child.dataset.url === url
            );
            if (draggedItem) {
                sourceList.removeChild(draggedItem);
    
                // Add the item to the target list
                targetList.appendChild(draggedItem);
    
                // Reapply draggable properties
                makeDraggable(draggedItem);
    
                // Reapply event listeners
                reattachEventListeners(draggedItem, targetList.id);
    
                // Update local storage
                updateLocalStorage(
                    mapListIdToLocalStorageKey(source),
                    url,
                    mapListIdToLocalStorageKey(targetList.id)
                );
    
                // Trigger confetti if moved from bookmarkList to logList
                if (source === 'bookmark-list' && targetList.id === 'log-list') {
                    triggerConfetti();
                }
            }
        }
    }

    function reattachEventListeners(item, targetListId) {
        const removeButton = item.querySelector('.remove-btn');
        if (removeButton) {
            const localStorageKey = mapListIdToLocalStorageKey(targetListId);
            removeButton.addEventListener('click', (ev) => {
                ev.stopPropagation();
                removeLogOrBookmark(item, localStorageKey);
            });
        }
    }

    function removeLogOrBookmark(item, localStorageKey) {
        const list = item.parentNode;
        list.removeChild(item);
    
        const storedItems = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        const updatedItems = storedItems.filter(
            (entry) => entry.url !== item.dataset.url
        );
        localStorage.setItem(localStorageKey, JSON.stringify(updatedItems));
    }

    function mapListIdToLocalStorageKey(listId) {
        if (listId === 'log-list') return 'logs';
        if (listId === 'bookmark-list') return 'bookmarks';
        return null;
    }

    // Update localStorage when an item is moved
    function updateLocalStorage(source, url, target) {
        const sourceData = JSON.parse(localStorage.getItem(source)) || [];
        const targetData = JSON.parse(localStorage.getItem(target)) || [];

        // Remove the URL from the source list
        const updatedSource = sourceData.filter((entry) => entry.url !== url);
        localStorage.setItem(source, JSON.stringify(updatedSource));

        // Add the URL to the target list
        const movedItem = sourceData.find((entry) => entry.url === url);
        if (movedItem) {
            targetData.push(movedItem);
            localStorage.setItem(target, JSON.stringify(targetData));
        }
    }

    // Make all existing items draggable
    document.querySelectorAll('.log-item').forEach(makeDraggable);

    // Add event listeners for drag-and-drop on both lists
    logList.addEventListener('dragover', handleDragOver);
    logList.addEventListener('drop', handleDrop);

    bookmarkList.addEventListener('dragover', handleDragOver);
    bookmarkList.addEventListener('drop', handleDrop);


    /* DARK MODE */

    // Function to update dark mode for all log items
    function updateLogItemsDarkMode() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        document.querySelectorAll('.log-item').forEach(item => {
            if (isDarkMode) {
                item.classList.add('dark-mode');
            } else {
                item.classList.remove('dark-mode');
            }
        });
    }

    // Check if dark mode is saved in localStorage
    if (localStorage.getItem('dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkmode-toggle').checked = true;  // Set the checkbox to checked
        document.querySelector('.container').classList.add('dark-mode');
        document.querySelector('.header-container').classList.add('dark-mode');
    } else {
        document.getElementById('darkmode-toggle').checked = false;  // Set the checkbox to unchecked
    }

    // Apply dark mode to existing log items when the page loads
    updateLogItemsDarkMode();

    // Toggle dark mode when the checkbox is clicked
    document.getElementById('darkmode-toggle').addEventListener('change', function () {
        document.body.classList.toggle('dark-mode');
        document.querySelector('.container').classList.toggle('dark-mode');
        document.querySelector('.header-container').classList.toggle('dark-mode');
        
        // Update dark mode for all log items
        updateLogItemsDarkMode();

        // Save the dark mode preference in localStorage
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('dark-mode', isDarkMode);
    });




    // Get the tabs and sections
    // Get the buttons and content sections
    const appliedTab = document.getElementById("applied-tab");
    const helloTab = document.getElementById("hello-tab");
    const appliedContent = document.getElementById("applied-content");
    const helloContent = document.getElementById("hello-content");

    // Add event listeners to each tab button
    appliedTab.addEventListener('click', () => {
        showTab('applied');
    });

    helloTab.addEventListener('click', () => {
        showTab('hello');
    });

    // Function to toggle between the tabs
    function showTab(tab) {
        if (tab === 'applied') {
            appliedContent.classList.add('active');
            helloContent.classList.remove('active');
        } else if (tab === 'hello') {
            helloContent.classList.add('active');
            appliedContent.classList.remove('active');
        }
    }



    /* Navigation Button */
    const firstTab = document.getElementById('applied-tab');
    if (firstTab) {
        firstTab.click();
    }



    document.querySelectorAll('nav button').forEach(button => {
        button.addEventListener('click', function () {
            // Remove the 'active' class from all buttons
            document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
            
            // Add the 'active' class to the clicked button
            this.classList.add('active');
            
            // Show the corresponding tab content
            const target = this.getAttribute('data-target');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(target).classList.add('active');
        });
    });


    initializeCVUploadHandlers();







    /* CELEBRATIONS */


    let rocket = null; // Declare the rocket globally to retain reference
    showRocket()

    const savedCelebration = localStorage.getItem('celebration-type');
    if (savedCelebration) {
        document.getElementById('celebration-type').value = savedCelebration;
    }
    
    document.getElementById('celebration-type').addEventListener('change', function() {
        const selectedCelebration = this.value;
        localStorage.setItem('celebration-type', selectedCelebration);
    });


    // Function to trigger the confetti
    function triggerConfetti() {
        const selectedEffect = document.getElementById('celebration-type').value;

        switch (selectedEffect) {
            case 'confetti':
                confetti(); // Trigger confetti effect
                break;
            case 'fireworks':
                launchFireworks(); // Placeholder for fireworks function
                break;
            case 'rocket':
                triggerRocketBlastOff(); // Trigger the rocket blast-off if it exists
                break;
    
            default:
                alert('Please select a celebration type!');
        }
    }


    function showRocket() {
        // Create the planet element (a circle with a gradient to make it look like a planet)
        const planet = document.createElement('div');
        planet.style.position = 'absolute';
        planet.style.left = `${window.innerWidth / 2 - 80}px`; // Horizontally centered
        planet.style.bottom = '-80px'; // Positioned at the very bottom of the screen
        planet.style.width = '300px'; // Size of the planet
        planet.style.height = '100px'; // Size of the planet
        planet.style.borderRadius = '50%'; // Makes it a circle
        planet.style.background = 'radial-gradient(circle,rgb(241, 162, 117),rgb(221, 138, 29))'; // Gradient for a planet-like effect
        planet.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)'; // Adds a shadow for depth
        planet.style.zIndex = '1'; // Ensures the planet stays behind the rocket

        // Append planet to the body
        document.body.appendChild(planet);

        // Create the rocket element
        rocket = document.createElement('img');
        rocket.src = './assets/Rocket-Emoji2.png'; // Initial rocket image
        rocket.alt = 'Rocket'; // Alt text for accessibility
        rocket.style.position = 'absolute';
        rocket.style.width = '40px'; // Adjust the width of the rocket image
        rocket.style.height = '40px'; // Adjust the height of the rocket image
        rocket.style.left = `${window.innerWidth / 2 - 15}px`; // Horizontally centered
        rocket.style.bottom = '0px'; // Position it just above the planet (adjust if necessary)
        rocket.style.zIndex = '2'; // Ensure the rocket is above the planet

        // Append rocket to the body
        document.body.appendChild(rocket);
    }

    // Trigger the rocket blast-off
    function triggerRocketBlastOff() {
        if (rocket) {
            // Change the rocket image to the second image (Rocket-Emoji.png) during the blast-off
            rocket.src = './assets/Rocket-Emoji.png'; // Change to the second rocket image

            // Animate the rocket to blast off (move vertically upwards)
            rocket.style.transition = 'transform 5s cubic-bezier(0.42, 0, 1, 1)'; // Transition only for the transform property
            rocket.style.transform = 'translateY(-160vh)'; // Combine the rotation with the upward translation

            // After the rocket has moved off-screen, return it to the original position
            setTimeout(() => {
                rocket.style.transition = 'transform 5s ease-in-out'; // Transition back for the transform property only
                rocket.style.transform = 'translateY(0)'; // Return to initial position (bottom of the screen)
            }, 6000); // After the rocket has been off-screen for 6 seconds

            // Listen for when the rocket's transition ends (after landing)
            rocket.addEventListener('transitionend', function onTransitionEnd(event) {
                // Only change back to Rocket-Emoji.png when the rocket has finished landing
                if (event.propertyName === 'transform') { // Ensure it's the "transform" transition that completed
                    rocket.src = './assets/Rocket-Emoji2.png'; // Change back to the original rocket image
                    rocket.removeEventListener('transitionend', onTransitionEnd); // Clean up the event listener
                }
            });
        }
    }





});