export const openInternshipDetails = (itemData) => {
    // Create a semi-transparent overlay
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    // Create the details container
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('details-container');

    // Create the date box (Top Left)
    const dateBox = document.createElement('div');
    dateBox.classList.add('date-box');
    const date = new Date(itemData.datetime);
    const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' }).toUpperCase()}`;
    dateBox.innerText = formattedDate;

    // Create the close button (Top Right)
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.innerText = 'X';
    closeButton.addEventListener('click', () => {
        overlay.style.opacity = '0'; // Trigger fade-out effect
        setTimeout(() => overlay.remove(), 300); // Remove after transition
    });


    // Retrieve the saved keywords from local storage
    const savedKeywords = JSON.parse(localStorage.getItem('keywords')) || [];

    // Generate the keywords display text if any keywords are found
    const keywordsText = savedKeywords.length > 0 ? 
        `<p><strong>Keywords Found:</strong> ${savedKeywords.join(', ')}</p>` :
        '';

    // Update the detailsContainer with the new structure
    detailsContainer.innerHTML = `
        <p style="margin-top: 50px;"><strong>Link:</strong> <a href="${itemData.url}" target="_blank">${shortenUrl(itemData.url)}</a></p>
        ${keywordsText} 
        <h3 style="margin-top: 30px;">Notes</h3>
        <textarea id="notesTextarea" rows="5" style="width: 100%; margin-bottom: 10px;" placeholder="Type your notes here..."></textarea>
    `;

    // Append elements to details container
    detailsContainer.appendChild(dateBox);
    detailsContainer.appendChild(closeButton);

    // Append the details container to the overlay
    overlay.appendChild(detailsContainer);

    // Add the overlay to the body
    document.body.appendChild(overlay);

    // Load existing notes from local storage
    const savedNotesKey = `notes_${itemData.url}`;
    const savedNotes = localStorage.getItem(savedNotesKey);
    const notesTextarea = document.getElementById('notesTextarea');

    // Prefill the textarea with the saved notes
    if (savedNotes) {
        notesTextarea.value = savedNotes; // Display the saved notes
    } else {
        notesTextarea.placeholder = "Type your notes here...";
    }

    // Automatically save notes on input
    notesTextarea.addEventListener('input', () => {
        const noteContent = notesTextarea.value; // Get the current note content
        localStorage.setItem(savedNotesKey, noteContent); // Save it to localStorage
    });
};

// Helper function to shorten URLs (dummy implementation)
export const shortenUrl = (url) => url.length > 20 ? url.slice(0, 20) + '...' : url;