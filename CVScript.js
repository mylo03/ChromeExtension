
    document.getElementById('uploadButton').addEventListener('click', function() {
        uploadCV();
    });

    // Function to upload the CV file and send it to the server
    function uploadCV() {
        const fileInput = document.getElementById('cvFile');
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('cv', file);

        fetch('/upload-cv', {  // Backend URL to handle file upload
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.keywordsFound) {
                document.getElementById('keywordResults').innerHTML = "Keywords Found: " + data.keywordsFound.join(', ');
            } else {
                document.getElementById('keywordResults').innerHTML = "No keywords found.";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }