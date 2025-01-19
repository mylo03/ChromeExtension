import { codingKeywords } from '../assets/coding-keywords.js';
import { generalKeywords } from '../assets/general-keywords.js';

// Function to split the tags into found and missing categories
export const searchJobsTags = (textContent, keywordResults) => {
    const foundTags = {
        coding: [],
        general: []
    };
    const missingTags = {
        coding: [],
        general: []
    };

    // Combine coding and general keywords into one list
    const allKeywords = [...codingKeywords, ...generalKeywords];

    // Search for keywords in textContent (job description) and keywordResults (tags from CV)
    allKeywords.forEach((keyword) => {
        const isKeywordInTextContent = textContent.includes(keyword); // Check if the keyword exists in the job description (textContent)
        const isKeywordInResults = keywordResults.includes(keyword); // Check if the keyword exists in the CV (keywordResults)

        if (isKeywordInTextContent) {
            if (isKeywordInResults) {
                // Keyword found in both text content and CV, add to foundTags
                if (codingKeywords.includes(keyword)) {
                    foundTags.coding.push(keyword);
                } else {
                    foundTags.general.push(keyword);
                }
            } else {
                // Keyword found in text content but not in CV, add to missingTags
                if (codingKeywords.includes(keyword)) {
                    missingTags.coding.push(keyword);
                } else {
                    missingTags.general.push(keyword);
                }
            }
        }
    });

    // Return both found and missing tags
    return { foundTags, missingTags };
};