export function searchKeywordsInText(textContent) {
    const foundKeywords = [];
    const keywords = ["Python", "JavaScript", "React", "HTML", "CSS", "Node.js"];

    keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (textContent.match(regex)) {
            foundKeywords.push(keyword);
        }
    });

    const keywordResults = document.getElementById('keyword-results');
    keywordResults.innerHTML = ''; // Clear previous results

    if (foundKeywords.length > 0) {
        foundKeywords.forEach((keyword) => {
            keywordResults.innerHTML += `<li>${keyword}</li>`;
        });
        keywordResults.innerHTML += `</ul>`;
    } else {
        keywordResults.innerHTML = `<h3>No Keywords Found</h3>`;
    }

    keywordResults.style.display = 'block'; // Ensure the section is visible
}