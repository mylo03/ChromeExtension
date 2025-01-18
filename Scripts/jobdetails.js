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
    dateRow.innerHTML = `<span>DATE:</span><span>${formattedDate}</span>`;

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

    // Update the detailsContainer with the new structure
    detailsContainer.appendChild(dateRow);
    detailsContainer.appendChild(linkRow);
    detailsContainer.appendChild(separator);
    detailsContainer.appendChild(notesTextarea);

    // Append the details container to the overlay
    overlay.appendChild(detailsContainer);

    // Add the overlay to the body
    document.body.appendChild(overlay);

    // Load existing notes from local storage
    const savedNotesKey = `notes_${itemData.url}`;
    const savedNotes = localStorage.getItem(savedNotesKey);

    // Prefill the textarea with the saved notes
    if (savedNotes) {
        notesTextarea.value = savedNotes;
    }

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