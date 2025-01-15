import { searchKeywordsInText } from './keywordSearch.js';

export function initializeCVUploadHandlers() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('cvFile');
    const fileInfo = document.getElementById('file-info');

    // Function to display the saved image and generate keywords (if available)
    function displaySavedImageAndKeywords() {
        const savedImage = localStorage.getItem('pdfImage');
        const savedText = localStorage.getItem('pdfText'); // Retrieve saved text content

        if (savedImage) {
            const imgElement = document.createElement('img');
            imgElement.src = savedImage;
            fileInfo.innerHTML = ''; // Clear previous content
            fileInfo.appendChild(imgElement); // Display the saved image inside the drop area

            // Generate keywords if saved text exists
            if (savedText) {
                searchKeywordsInText(savedText);
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
        } else {
            fileInfo.innerHTML = `<p>File is not a PDF. Please upload a valid CV.</p>`;
        }
    }

    async function renderPDF(arrayBuffer) {
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const scale = 1.5;
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
        searchKeywordsInText(textContent);
    }
}