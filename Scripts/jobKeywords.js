import { codingKeywords } from '../assets/coding-keywords.js';
import { generalKeywords } from '../assets/general-keywords.js';
import { financeKeywords } from '../assets/finance-keywords.js';  
import { quantKeywords } from '../assets/quant-keywords.js';  // Importing quant-related keywords

// Function to split the tags into found and missing categories
export const searchJobsTags = (textContent, keywordResults) => {
    const foundTags = {
        coding: [],
        general: [],
        finance: [],  // Add finance category
        quant: []  // Add quant category
    };
    const missingTags = {
        coding: [],
        general: [],
        finance: [],  // Add finance category
        quant: []  // Add quant category
    };

    // Combine coding, general, finance, and quant keywords into one list
    const allKeywords = [...codingKeywords, ...generalKeywords, ...financeKeywords, ...quantKeywords];  // Include quant keywords

    // Search for keywords in textContent (job description) and keywordResults (tags from CV)
    allKeywords.forEach((keyword) => {
        const isKeywordInTextContent = textContent.includes(keyword); // Check if the keyword exists in the job description (textContent)
        const isKeywordInResults = keywordResults.includes(keyword); // Check if the keyword exists in the CV (keywordResults)

        if (isKeywordInTextContent) {
            if (isKeywordInResults) {
                // Keyword found in both text content and CV, add to foundTags
                if (codingKeywords.includes(keyword)) {
                    foundTags.coding.push(keyword);
                } else if (generalKeywords.includes(keyword)) {
                    foundTags.general.push(keyword);
                } else if (financeKeywords.includes(keyword)) {  // Check if it's a finance keyword
                    foundTags.finance.push(keyword);  // Add to finance category
                } else if (quantKeywords.includes(keyword)) {  // Check if it's a quant keyword
                    foundTags.quant.push(keyword);  // Add to quant category
                }
            } else {
                // Keyword found in text content but not in CV, add to missingTags
                if (codingKeywords.includes(keyword)) {
                    missingTags.coding.push(keyword);
                } else if (generalKeywords.includes(keyword)) {
                    missingTags.general.push(keyword);
                } else if (financeKeywords.includes(keyword)) {  // Check if it's a finance keyword
                    missingTags.finance.push(keyword);  // Add to finance category
                } else if (quantKeywords.includes(keyword)) {  // Check if it's a quant keyword
                    missingTags.quant.push(keyword);  // Add to quant category
                }
            }
        }
    });

    // Return both found and missing tags
    return { foundTags, missingTags };
};