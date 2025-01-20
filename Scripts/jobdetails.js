import { searchJobsTags } from './jobKeywords.js';


export const openInternshipDetails = (itemData) => {
    // Create a semi-transparent overlay
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    // Create the details container
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('details-container');

    // Create the date and link rows
    const dateRow = document.createElement('div');
    dateRow.classList.add('info-row');
    const date = new Date(itemData.datetime);
    const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' }).toUpperCase()}`;
    dateRow.innerHTML = `<span>DATE FOUND:</span><span>${formattedDate}</span>`;

    const linkRow = document.createElement('div');
    linkRow.classList.add('info-row');
    linkRow.innerHTML = `<span>LINK:</span><span><a href="${itemData.url}" target="_blank">${shortenUrl(itemData.url)}</a></span>`;

    // Add a separator line
    const separator = document.createElement('div');
    separator.classList.add('separator');

    // Create the textarea for notes
    const notesTextarea = document.createElement('textarea');
    notesTextarea.id = "notesTextarea";
    notesTextarea.rows = 5;
    notesTextarea.placeholder = "Type your notes here...";

    // Load existing notes from local storage
    const savedNotesKey = `notes_${itemData.url}`;
    const savedNotes = localStorage.getItem(savedNotesKey);

    // Prefill the textarea with the saved notes
    if (savedNotes) {
        notesTextarea.value = savedNotes;
    }

    // Create the section for saved page text
    const savedPageText = itemData.pageText;
    const TagContainer = document.createElement('div');
    TagContainer.id = "saved-tags-job";  
    TagContainer.classList.add('saved-tags-job');


    // Get the tags that are found and missing
    const storedKeywords = localStorage.getItem('allKeywordResults');
    const keywordResultsArray = storedKeywords ? JSON.parse(storedKeywords) : [];
    const { foundTags, missingTags } = searchJobsTags(savedPageText, keywordResultsArray);


    // Function to create the tag elements
    const createTagElement = (tag, isFound) => {
        const tagElement = document.createElement('span');
        tagElement.textContent = tag;

        // Set the styles based on whether the tag is found or missing
        if (isFound) {
            tagElement.style.color = 'black';
            tagElement.style.backgroundColor = '#f9f9f9'; // Optional: Background color for tags
            tagElement.style.borderRadius = '15px';
            tagElement.style.padding = '5px 10px';
            tagElement.style.marginRight = '10px';
        } else {
            tagElement.style.color = 'black';
            tagElement.style.backgroundColor = '#f9f9f9'; // Optional: Background color for missing tags
            tagElement.style.borderRadius = '15px';
            tagElement.style.padding = '5px 10px';
            tagElement.style.marginRight = '10px';
        }
        return tagElement;
    };

    // Create a section for "Looking For:" and append it
    const lookingForSection = document.createElement('div');
    lookingForSection.innerHTML = '<h3>LOOKING FOR:</h3>';
    lookingForSection.style.marginBottom = '10px';
    lookingForSection.style.marginLeft = '0px';
    lookingForSection.style.textAlign = 'left'; 

    // Display the found tags first (with tick emojis)
    const foundTagsContainer = document.createElement('div');
    foundTagsContainer.style.display = 'flex';
    foundTagsContainer.style.flexWrap = 'nowrap'; // Keep tags in a single row
    foundTagsContainer.style.overflowX = 'auto'; // Enable horizontal scrolling if needed

    foundTags.coding.forEach(tag => {
        const tagElement = createTagElement(tag, true);
        foundTagsContainer.appendChild(tagElement);
    });

    foundTags.general.forEach(tag => {
        const tagElement = createTagElement(tag, true);
        foundTagsContainer.appendChild(tagElement);
    });
    TagContainer.appendChild(foundTagsContainer);  // Add found tags below "Looking For:"

    // Add a 5px break before the missing tags
    const breakLine = document.createElement('div');
    breakLine.style.height = '5px'; // Create a 5px gap
    TagContainer.appendChild(breakLine);

    // Create a new line below and display the missing tags (with question mark emojis)
    const missingTagsContainer = document.createElement('div');
    missingTagsContainer.style.display = 'flex';
    missingTagsContainer.style.flexWrap = 'nowrap'; // Keep missing tags in a single row (horizontal scrolling)
    missingTagsContainer.style.overflowX = 'auto'; // Enable horizontal scrolling for missing tags
    
    
    missingTags.coding.forEach(tag => {
        const tagElement = createTagElement(tag, false);
        missingTagsContainer.appendChild(tagElement);
    });

    missingTags.general.forEach(tag => {
        const tagElement = createTagElement(tag, false);
        missingTagsContainer.appendChild(tagElement);
    });
    TagContainer.appendChild(missingTagsContainer);  // Add missing tags below found tags

    // Create a border around the tags section
    const border = document.createElement('div');
    border.classList.add('section-border');

    // Apply styles to make the tags scrollable if they exceed the screen height
    TagContainer.style.maxHeight = '300px';  // Set a max height (you can adjust this)
    TagContainer.style.overflowY = 'auto';  // Enable vertical scrolling if content overflows
    TagContainer.style.whiteSpace = 'normal'; // Allow tags to wrap onto multiple lines
    TagContainer.style.boxSizing = 'border-box';  // Ensure padding doesn't affect maxHeight
    TagContainer.style.marginLeft = '20px'; 
    TagContainer.style.padding = '0px'; 

    const tickElement = document.createElement('div');
    tickElement.textContent = '✅';
    tickElement.style.position = 'absolute'; // Use absolute positioning
    tickElement.style.top = '228px';         // Adjust as needed
    tickElement.style.left = '20px';       // Adjust as needed
    tickElement.style.fontSize = '14px';    // Optional: style the tick
    tickElement.style.color = 'green'; 


    const crossElement = document.createElement('div');
    crossElement.textContent = '❓';
    crossElement.style.position = 'absolute'; // Use absolute positioning
    crossElement.style.top = '255px';         // Adjust as needed
    crossElement.style.left = '20px';       // Adjust as needed
    crossElement.style.fontSize = '14px';    // Optional: style the tick
    crossElement.style.color = 'red'; 

    // Update the detailsContainer with the new structure
    detailsContainer.insertBefore(tickElement, detailsContainer.firstChild); 
    detailsContainer.insertBefore(crossElement, detailsContainer.firstChild); 
    detailsContainer.appendChild(dateRow);
    detailsContainer.appendChild(linkRow);
    detailsContainer.appendChild(separator);
    detailsContainer.appendChild(notesTextarea);
    detailsContainer.appendChild(border);  // Border added between tags and notes section
    detailsContainer.appendChild(lookingForSection); 
    detailsContainer.appendChild(TagContainer);

    // Append the details container to the overlay
    overlay.appendChild(detailsContainer);

    // Add the overlay to the body
    document.body.appendChild(overlay);

    // Automatically save notes on input
    notesTextarea.addEventListener('input', () => {
        const noteContent = notesTextarea.value;
        localStorage.setItem(savedNotesKey, noteContent); // Save it to localStorage
    });

    // Close the overlay when tapping outside the details container
    overlay.addEventListener('click', (e) => {
        if (!detailsContainer.contains(e.target)) {
            overlay.style.opacity = '0'; // Trigger fade-out effect
            setTimeout(() => overlay.remove(), 300); // Remove after transition
        }
    });
};

// Helper function to shorten URLs
export const shortenUrl = (url) => url.length > 20 ? url.slice(0, 20) + '...' : url;