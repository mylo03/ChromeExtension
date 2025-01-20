import { searchKeywordsInText } from './keywordSearch.js';

export function initializeCVUploadHandlers() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('cvFile');
    const fileInfo = document.getElementById('file-info');
    const keywordResults = document.getElementById('keyword-results'); // Get keyword results container

    // Function to display the saved image and generate keywords (if available)
    function displaySavedImageAndKeywords() {
        const savedImage = localStorage.getItem('pdfImage');
        const savedText = localStorage.getItem('pdfText'); // Retrieve saved text content
        const savedFileName = localStorage.getItem('pdfFileName'); // Retrieve saved PDF file name
    
        if (savedImage) {
            const container = document.createElement('div');
            container.style.display = 'flex'; // Flexbox layout for image and title
            container.style.alignItems = 'center'; // Vertically center the items
            container.style.gap = '20px'; // Add space between image and title
    
            // Create and append the image
            const imgElement = document.createElement('img');
            imgElement.src = savedImage;
            imgElement.style.width = '100px'; // Adjust the image size
            imgElement.style.height = 'auto';
    
            // Create and append the title (PDF file name)
            const titleElement = document.createElement('h3');
            titleElement.textContent = savedFileName || 'No File Uploaded'; // Show file name
    
            container.appendChild(imgElement);
            container.appendChild(titleElement);
    
            fileInfo.innerHTML = ''; // Clear previous content
            fileInfo.appendChild(container); // Append the container with image and title
    
            // Generate keywords if saved text exists
            if (savedText) {
                searchKeywordsInText(savedText, keywordResults); // Pass keywordResults here
            }
        }
    }

    displaySavedImageAndKeywords();

    // Drag-and-drop event listeners
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('dragging');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragging');
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dropArea.classList.remove('dragging');
        handleFile(event.dataTransfer.files[0]);
    });

    // File input change event listener
    fileInput.addEventListener('change', () => {
        handleFile(fileInput.files[0]);
    });

    function handleFile(file) {
        if (file.type === "application/pdf") {
            const fileReader = new FileReader();
            fileReader.onload = function () {
                const arrayBuffer = this.result;
                renderPDF(arrayBuffer);
            };
            fileReader.readAsArrayBuffer(file);
    
            // Store the file name
            localStorage.setItem('pdfFileName', file.name); // Store the file name
        } else {
            fileInfo.innerHTML = `<p>File is not a PDF. Please upload a valid CV.</p>`;
        }
    }

    async function renderPDF(arrayBuffer) {
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const scale = 1.2;
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
    
        canvas.height = viewport.height;
        canvas.width = viewport.width;
    
        await page.render({
            canvasContext: context,
            viewport: viewport,
        }).promise;
    
        const imageUrl = canvas.toDataURL();
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        fileInfo.innerHTML = '';
        fileInfo.appendChild(imgElement);
    
        localStorage.setItem('pdfImage', imageUrl);
    
        // Extract text content
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            text.items.forEach((item) => {
                textContent += item.str + ' ';
            });
        }
    
        // Save text content and search for keywords
        localStorage.setItem('pdfText', textContent);
        searchKeywordsInText(textContent, keywordResults); // Pass keywordResults here



        function extractKeywords(targetElement) {
            // Get all keyword tags in the target element
            const keywordTags = targetElement.querySelectorAll('.keyword-tag');
            
            // Extract the text content of each tag and return as an array
            return Array.from(keywordTags).map(tag => tag.textContent.trim());
        }

        const allKeywordResults = extractKeywords(keywordResults); 
        localStorage.setItem('allKeywordResults', JSON.stringify(allKeywordResults));

    
        // Immediately update the display after saving the text
        displaySavedImageAndKeywords();  // <-- Added this line to trigger an update
    }
}