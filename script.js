import * as pdfjsLib from './libs/pdf.mjs'; 
import { initializeCVUploadHandlers } from './Scripts/cvUploadHandler.js';
import { openInternshipDetails } from './Scripts/jobdetails.js';


document.addEventListener('DOMContentLoaded', () => {

    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('./libs/pdf.worker.mjs');

    const logList = document.getElementById('log-list');
    const bookmarkList = document.getElementById('bookmark-list');
    const logButton = document.getElementById('log-button');
    const bookmarkButton = document.getElementById('bookmark-button');

    // Utility Functions
    const fetchFavicon = (url) => {
        return new Promise((resolve) => {
            const parser = new URL(url);
            const faviconUrl = `${parser.origin}/favicon.ico`;

            const img = new Image();
            img.onload = () => resolve(faviconUrl);
            img.onerror = () => resolve(generateFallbackFavicon(parser.hostname));
            img.src = faviconUrl;
        });
    };

    const generateFallbackFavicon = (hostname) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.height = 50;

        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.font = '30px Arial';
        ctx.fillText(hostname.charAt(0).toUpperCase(), 15, 35);

        return canvas.toDataURL();
    };


    const logCurrentTab = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
        
            // Function to extract all text content from the page
            function extractText() {
                return document.body.innerText; // Get all visible text from the page
            }
        
            // Execute the script in the target tab
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: extractText,
            })
            .then((results) => {
                // The result will be in results[0].result, which contains all the page's text
                const pageText = results[0].result;
        
                // Get the URL of the current tab
                const url = tab.url;
                const storedLogs = JSON.parse(localStorage.getItem('logs')) || []; // Add default empty array if no logs are found
                const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || []; // Same for bookmarks
        
                // Check if the URL is not already in logs or bookmarks
                if (!storedLogs.some(item => item.url === url) && !storedBookmarks.some(item => item.url === url)) {
                    fetchFavicon(url).then((faviconUrl) => {
                        // Pass the pageText along with the other data
                        addItemToList(logList, { url, faviconUrl, pageText }, 'logs');
                        triggerConfetti();
                    });
                }
            })
        });
    };


    // Bookmark Current Tab with Page Text
    const bookmarkCurrentTab = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            const url = tab.url;
            
            // Function to extract all text content from the page
            function extractText() {
                return document.body.innerText; // Get all visible text from the page
            }

            // Execute the script in the target tab
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: extractText,
            })
            .then((results) => {
                // The result will be in results[0].result, which contains all the page's text
                const pageText = results[0].result;

                const storedLogs = JSON.parse(localStorage.getItem('logs')) || [];
                const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

                // Check if the URL is not already in logs or bookmarks
                if (!storedLogs.some(item => item.url === url) && !storedBookmarks.some(item => item.url === url)) {
                    fetchFavicon(url).then((faviconUrl) => {
                        // Pass the pageText along with the other data
                        addItemToList(bookmarkList, { url, faviconUrl, pageText }, 'bookmarks');
                        triggerConfetti(); // Trigger confetti for successful bookmarking
                    });
                } else {
                    // The bookmark already exists, so find the existing icon based on faviconUrl
                    const existingBookmark = [...storedLogs, ...storedBookmarks].find(item => item.url === url);
                    // You can decide to update this bookmark's data if needed (like pageText, faviconUrl, etc.)
                }
            });
        });
    };


    const addItemToList = (list, itemData, localStorageKey) => {
        /* Tag Searching */
        const listItem = document.createElement('li');
        listItem.dataset.url = itemData.url; // Store the URL as a dataset
        listItem.classList.add('log-item');
        listItem.style.position = 'relative'; // Required for positioning the remove button

        // Capture the current datetime
        const datetime = new Date().toISOString(); 
        itemData.datetime = datetime; // Save datetime in itemData
    
        // Create the favicon container
        const faviconElement = document.createElement('div');
        faviconElement.classList.add('favicon-box');
        faviconElement.style.cursor = 'pointer'; // Indicate clickability
    
        // Apply flexbox styles to center the favicon image
        faviconElement.style.display = 'flex';
        faviconElement.style.justifyContent = 'center';  // Horizontally center
        faviconElement.style.alignItems = 'center';      // Vertically center
        faviconElement.style.width = '20px';              // Set a fixed width
        faviconElement.style.height = '20px';             // Set a fixed height
    
        const faviconImg = document.createElement('img');
        faviconImg.src = itemData.faviconUrl;
        faviconImg.style.width = '20px';
        faviconImg.style.height = '20px';
        faviconImg.style.objectFit = 'cover';
    
        faviconElement.appendChild(faviconImg); // Append the image to the box
    
        // Function to extract the color from the top-left pixel of the favicon
        const getEdgeColor = (faviconUrl, callback) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = faviconUrl;
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, 1, 1); // Get the color of the top-left pixel
                const rgba = imageData.data;
    
                // Check if the pixel is transparent (alpha = 0)
                if (rgba[3] === 0) {
                    callback("rgb(255, 255, 255)"); // Return white if transparent
                } else {
                    const color = `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`;
                    callback(color); // Return the color
                }
            };
        };
    
        // Get the edge color of the favicon and set the background color of the list item
        getEdgeColor(itemData.faviconUrl, (edgeColor) => {
            listItem.style.backgroundColor = edgeColor; // Set background color based on the edge pixel
        });
    
        // Add click event to the favicon box to open the internship details
        faviconElement.addEventListener('click', (e) => {
            openInternshipDetails(itemData); // Call a function to display the internship details
        });
    
        // Prevent clicks on the remove button from propagating to the favicon
        faviconElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                e.stopPropagation();
            }
        });
    
        // Remove button for deleting the item
        const removeButton = document.createElement('span');
        removeButton.classList.add('remove-btn');
        removeButton.textContent = '-';
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from triggering favicon action
            removeItem(listItem, localStorageKey);
        });
    
        // Append elements to the list item
        listItem.append(faviconElement, removeButton);
        list.prepend(listItem);

        // Save the data to localStorage
        saveToLocalStorage(localStorageKey, itemData);
    
        // Make the item draggable
        makeDraggable(listItem);
    };


    // Remove Item
    const removeItem = (listItem, localStorageKey) => {
        const list = listItem.parentElement;
        const url = listItem.dataset.url;

        list.removeChild(listItem);
        const storedItems = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        const updatedItems = storedItems.filter((item) => item.url !== url);
        localStorage.setItem(localStorageKey, JSON.stringify(updatedItems));
    };

    // Save to Local Storage
    const saveToLocalStorage = (key, data) => {
        const storedItems = JSON.parse(localStorage.getItem(key)) || [];
        if (!storedItems.some((item) => item.url === data.url)) {
            storedItems.push(data);
            localStorage.setItem(key, JSON.stringify(storedItems));
        }
    };

    // Load Items from Local Storage
    const loadItems = (list, localStorageKey) => {
        list.innerHTML = '';
        const storedItems = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        storedItems.forEach((itemData) => addItemToList(list, itemData, localStorageKey));
    };

    


    // Make List Item Draggable
    const makeDraggable = (item) => {
        item.draggable = true;
        item.addEventListener('dragstart', handleDragStart);
    };

    const handleDragStart = (event) => {
        const { target } = event;
        event.dataTransfer.setData('text/plain', target.dataset.url);
        event.dataTransfer.setData('source', target.parentNode.id);
        target.classList.add('dragging');
    };

    const handleDragOver = (event) => event.preventDefault();

    const handleDrop = (event) => {
        event.preventDefault();

        const url = event.dataTransfer.getData('text/plain');
        const sourceId = event.dataTransfer.getData('source');
        const targetList = event.target.closest('ul');

        if (targetList && targetList.id !== sourceId) {
            const sourceList = document.getElementById(sourceId);
            const draggedItem = [...sourceList.children].find((child) => child.dataset.url === url);

            if (draggedItem) {
                sourceList.removeChild(draggedItem);
                targetList.prepend(draggedItem);

                const sourceKey = mapListIdToStorageKey(sourceId);
                const targetKey = mapListIdToStorageKey(targetList.id);

                moveItemBetweenStorage(sourceKey, targetKey, url);
                makeDraggable(draggedItem);
            }
        }

        if (sourceId === 'bookmark-list' && targetList.id === 'log-list') {
            triggerConfetti();
        }
    };


    // Move Item Between Storage
    const moveItemBetweenStorage = (sourceKey, targetKey, url) => {
        const sourceItems = JSON.parse(localStorage.getItem(sourceKey)) || [];
        const targetItems = JSON.parse(localStorage.getItem(targetKey)) || [];

        const item = sourceItems.find((entry) => entry.url === url);
        if (item) {
            sourceItems.splice(sourceItems.indexOf(item), 1);
            targetItems.push(item);

            localStorage.setItem(sourceKey, JSON.stringify(sourceItems));
            localStorage.setItem(targetKey, JSON.stringify(targetItems));
        }
    };

    const mapListIdToStorageKey = (listId) => {
        return listId === 'log-list' ? 'logs' : listId === 'bookmark-list' ? 'bookmarks' : null;
    };

    // Event Listeners
    logButton.addEventListener('click', logCurrentTab);
    bookmarkButton.addEventListener('click', bookmarkCurrentTab);

    // Initialize
    loadItems(logList, 'logs');
    loadItems(bookmarkList, 'bookmarks');

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


    /* ROCKET */

    let rocket = null; // Declare rocket globally to retain reference

    // Initial call to showRocket to display rocket and planet
    showRocket();

    // Function to display rocket and planet
    function showRocket() {
        // Remove previously created planet or rocket to avoid duplicates
        const existingPlanet = document.querySelector('.planet');
        if (existingPlanet) existingPlanet.remove();
        
        const existingRocket = document.querySelector('.rocket');
        if (existingRocket) existingRocket.remove();

        // Create the planet element
        const planet = document.createElement('div');
        planet.classList.add('planet');
        planet.style.position = 'absolute';
        planet.style.left = '-35%';
        planet.style.bottom = '-80px';
        planet.style.width = '500px';
        planet.style.height = '100px';
        planet.style.borderRadius = '50%';
        planet.style.background = 'radial-gradient(circle, rgb(241, 162, 117), rgb(221, 138, 29))';
        planet.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        planet.style.zIndex = '1';

        document.body.appendChild(planet);

        // Create and display the rocket
        rocket = document.createElement('img');
        rocket.classList.add('rocket');
        rocket.src = './assets/Rocket-Emoji2.png';
        rocket.alt = 'Rocket';
        rocket.style.position = 'absolute';
        rocket.style.width = '60px';
        rocket.style.height = '60px';
        rocket.style.left = '2%';
        rocket.style.bottom = '6px';
        rocket.style.zIndex = '2';

        document.body.appendChild(rocket);
    }

    // Function to update the flag
    const savedFlag = localStorage.getItem('flag-type') || '🇬🇧'; // Default to 🇬🇧 if no flag is saved

    // Set the flag dropdown value to the saved flag or default
    document.getElementById('flag-type').value = savedFlag;

    // Event listener to save the selected flag in localStorage
    document.getElementById('flag-type').addEventListener('change', function() {
        const selectedFlag = this.value;
        localStorage.setItem('flag-type', selectedFlag); // Save the selected flag
        updateFlag(selectedFlag); // Call updateFlag to update the flag
    });

    // Call updateFlag immediately to show the initial flag
    updateFlag(savedFlag);

    // Function to update the flag
    function updateFlag(selectedFlag) {
        // Remove existing flag stick if it exists
        const existingFlagStick = document.querySelector('.flag-stick');
        if (existingFlagStick) existingFlagStick.remove();

        // Create the flag stick element
        const flagStick = document.createElement('div');
        flagStick.classList.add('flag-stick');
        flagStick.style.position = 'absolute';
        flagStick.style.left = '20%';
        flagStick.style.bottom = '20px';
        flagStick.style.width = '1px';
        flagStick.style.height = '30px';
        flagStick.style.backgroundColor = 'rgb(54, 53, 53)';
        flagStick.style.zIndex = '2';

        // Create the flag emoji element
        const flagEmojiElement = document.createElement('div');
        flagEmojiElement.textContent = selectedFlag; // Set the selected flag emoji
        flagEmojiElement.style.position = 'absolute';
        flagEmojiElement.style.fontSize = '20px';
        flagEmojiElement.style.zIndex = '2';
        flagEmojiElement.style.bottom = '10px'; // Move flag higher on the stick

        flagStick.appendChild(flagEmojiElement);
        flagStick.style.transform = 'rotate(5deg)';

        // Append the flag stick to the body
        document.body.appendChild(flagStick);
    }
    
    // Trigger the rocket blast-off
    function triggerRocketBlastOff() {
        if (rocket) {
            rocket.src = './assets/Rocket-Emoji.png'; // Change to the second rocket image
    
            rocket.style.transition = 'transform 5s cubic-bezier(0.42, 0, 1, 1)';
            rocket.style.transform = 'translateY(-160vh)';
    
            setTimeout(() => {
                rocket.style.transition = 'transform 5s ease-in-out';
                rocket.style.transform = 'translateY(0)';
            }, 6000);
    
            rocket.addEventListener('transitionend', function onTransitionEnd(event) {
                if (event.propertyName === 'transform') {
                    rocket.src = './assets/Rocket-Emoji2.png'; // Change back to the original rocket image
                    rocket.removeEventListener('transitionend', onTransitionEnd);
                }
            });
        }
    }




    /* GREETING */
    const greetingElement = document.getElementById('greeting');
    const currentHour = new Date().getHours();

    // Set greeting based on the time of day
    if (currentHour >= 5 && currentHour < 12) {
        greetingElement.textContent = 'Good morning!';
    } else if (currentHour >= 12 && currentHour < 18) {
        greetingElement.textContent = 'Good afternoon!';
    } else if (currentHour >= 18 && currentHour < 23) {
        greetingElement.textContent = 'Good evening!';
    } else {
        greetingElement.textContent = 'Late-night hustle!';
    }


    const profileImageElement = document.getElementById('profile-image');
    const storedImage = localStorage.getItem('profileImage');

    if (storedImage) {
        profileImageElement.style.backgroundImage = `url(${storedImage})`;
        document.getElementById('upload-message').style.display = 'none'; // Hide message if there's an image
    } else {
        document.getElementById('upload-message').style.display = 'block'; // Show upload message if no image
    }

    // Handle drag and drop image upload
    profileImageElement.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    profileImageElement.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageUrl = event.target.result;
                profileImageElement.style.backgroundImage = `url(${imageUrl})`;
                localStorage.setItem('profileImage', imageUrl); // Save the image in local storage
                document.getElementById('upload-message').style.display = 'none'; // Hide upload message
            };
            reader.readAsDataURL(files[0]);
        }
    });





    // Collapsable
    //const header = document.querySelector('header');
    //const toggleButton = document.getElementById('toggle-button');

    //toggleButton.addEventListener('click', () => {
     //   if (header.classList.contains('collapsed')) {
            // Expand the header
    //        header.classList.remove('collapsed');
    //        header.classList.add('expanded');
     //       toggleButton.textContent = '<'; // Change to collapse symbol
       // } else {
            // Collapse the header
         //   header.classList.remove('expanded');
           // header.classList.add('collapsed');
        //    toggleButton.textContent = '>'; // Change to expand symbol
       // }
    //});




});