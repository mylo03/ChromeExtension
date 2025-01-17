import { codingKeywords } from '../assets/coding-keywords.js';
import { generalKeywords } from '../assets/general-keywords.js';

export function searchKeywordsInText(textContent) {
    const foundKeywords = {
        coding: [],
        general: []
    };

    // Search in coding keywords
    codingKeywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (textContent.match(regex)) {
            foundKeywords.coding.push(keyword);
        }
    });

    // Search in general keywords
    generalKeywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (textContent.match(regex)) {
            foundKeywords.general.push(keyword);
        }
    });

    const keywordResults = document.getElementById('keyword-results');
    keywordResults.innerHTML = ''; // Clear previous results

    // Display coding keywords with a specific color
    if (foundKeywords.coding.length > 0) {
        foundKeywords.coding.forEach((keyword) => {
            keywordResults.innerHTML += `<span class="keyword-tag coding-keyword">${keyword}</span>`;
        });
    }

    // Display general keywords with a different color
    if (foundKeywords.general.length > 0) {
        foundKeywords.general.forEach((keyword) => {
            keywordResults.innerHTML += `<span class="keyword-tag general-keyword">${keyword}</span>`;
        });
    }

    // If no keywords found
    if (foundKeywords.coding.length === 0 && foundKeywords.general.length === 0) {
        keywordResults.innerHTML = `<h3>No Keywords Found</h3>`;
    }

    keywordResults.style.display = 'block'; // Ensure the section is visible
}