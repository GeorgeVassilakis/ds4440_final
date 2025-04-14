// API for handling similarity data without loading the full matrix

/**
 * Get recommendations for a song by ID
 * This avoids loading the full similarity matrix by using the pre-computed
 * embeddings to calculate the similarities on demand
 * 
 * @param {string} songId - ID of the source song
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} - Array of recommendation objects with songId and similarity
 */
async function getSimilarSongs(songId, limit = 5) {
    try {
        // If we already have the embeddings data, use it
        if (window.songEmbeddings && window.songIds) {
            return getRecommendationsFromEmbeddings(songId, limit);
        }
        
        // Otherwise, load the embeddings data first
        const embeddingsResponse = await fetch('song_embeddings.csv');
        const embeddingsText = await embeddingsResponse.text();
        
        const embeddingsData = parseEmbeddingsCSV(embeddingsText);
        window.songEmbeddings = embeddingsData.embeddings;
        window.songIds = embeddingsData.songIds;
        
        // Now get recommendations
        return getRecommendationsFromEmbeddings(songId, limit);
    } catch (error) {
        console.error('Error getting similar songs:', error);
        throw new Error(`Failed to get recommendations for song ${songId}: ${error.message}`);
    }
}

/**
 * Helper function to get recommendations from embeddings
 * @param {string} songId - ID of the source song
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Array} - Array of recommendation objects
 */
function getRecommendationsFromEmbeddings(songId, limit) {
    // Get the embedding for the source song
    const sourceEmbedding = window.songEmbeddings[songId];
    
    if (!sourceEmbedding) {
        throw new Error(`Embedding for song ID ${songId} not found.`);
    }
    
    // Calculate similarity with all other songs
    const similarities = [];
    
    for (const id of window.songIds) {
        if (id !== songId) {
            const targetEmbedding = window.songEmbeddings[id];
            const similarity = cosineSimilarity(sourceEmbedding, targetEmbedding);
            similarities.push({ songId: id, similarity });
        }
    }
    
    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Return top N recommendations
    return similarities.slice(0, limit);
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} - Similarity score between 0 and 1
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
        return 0;
    }
    
    return dotProduct / (normA * normB);
}

/**
 * Parse the embeddings CSV file
 * @param {string} csvText - CSV file contents
 * @returns {Object} - Object with songIds array and embeddings object
 */
function parseEmbeddingsCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    const songIds = [];
    const embeddings = {};
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const songId = values[0];
        
        // Create embedding array (skip first column which is song_id)
        const embedding = values.slice(1).map(val => parseFloat(val));
        
        songIds.push(songId);
        embeddings[songId] = embedding;
    }
    
    return { songIds, embeddings };
} 