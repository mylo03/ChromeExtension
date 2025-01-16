import { keywords } from '../assets/keywords.js';

export function searchKeywordsInText(textContent) {
    const foundKeywords = [];

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
            keywordResults.innerHTML += `<span class="keyword-tag">${keyword}</span>`;
        });
    } else {
        keywordResults.innerHTML = `<h3>No Keywords Found</h3>`;
    }

    keywordResults.style.display = 'block'; // Ensure the section is visible
}