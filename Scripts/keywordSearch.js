import { codingKeywords } from '../assets/coding-keywords.js';
import { generalKeywords } from '../assets/general-keywords.js';
import { financeKeywords } from '../assets/finance-keywords.js';  
import { quantKeywords } from '../assets/quant-keywords.js';  // Importing quant-related keywords

export function searchKeywordsInText(textContent, targetElement) {
    const foundKeywords = {
        coding: [],
        general: [],
        finance: [],  // Finance category
        quant: []  // Quantitative category
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

    // Search in finance keywords
    financeKeywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (textContent.match(regex)) {
            foundKeywords.finance.push(keyword);  // Add to finance category
        }
    });

    // Search in quant keywords
    quantKeywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (textContent.match(regex)) {
            foundKeywords.quant.push(keyword);  // Add to quant category
        }
    });

    // Clear previous results in the target container
    targetElement.innerHTML = ''; 

    // Display coding keywords with a specific color
    if (foundKeywords.coding.length > 0) {
        foundKeywords.coding.forEach((keyword) => {
            targetElement.innerHTML += `<span class="keyword-tag coding-keyword">${keyword}</span>`;
        });
    }

    // Display general keywords with a different color
    if (foundKeywords.general.length > 0) {
        foundKeywords.general.forEach((keyword) => {
            targetElement.innerHTML += `<span class="keyword-tag general-keyword">${keyword}</span>`;
        });
    }

    // Display finance keywords with another color
    if (foundKeywords.finance.length > 0) {
        foundKeywords.finance.forEach((keyword) => {
            targetElement.innerHTML += `<span class="keyword-tag finance-keyword">${keyword}</span>`;
        });
    }

    // Display quant keywords with another color
    if (foundKeywords.quant.length > 0) {
        foundKeywords.quant.forEach((keyword) => {
            targetElement.innerHTML += `<span class="keyword-tag quant-keyword">${keyword}</span>`;
        });
    }

    // If no keywords found
    if (foundKeywords.coding.length === 0 && foundKeywords.general.length === 0 && foundKeywords.finance.length === 0 && foundKeywords.quant.length === 0) {
        targetElement.innerHTML = `<h3>No Keywords Found</h3>`;
    }

    targetElement.style.display = 'block'; // Ensure the section is visible
}