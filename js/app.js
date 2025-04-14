// Music Recommender System - Main JavaScript File

// Global variables
let songEmbeddings = null;
let similarityMatrix = null;
let songIds = null;
let selectedModel = 'ae'; // 'ae' for regular autoencoder, 'vae' for variational autoencoder

// Initialize application on document load
document.addEventListener('DOMContentLoaded', () => {
    // Load the embeddings data
    loadEmbeddingsData();
    
    // Set up form submission handler
    const form = document.getElementById('recommender-form');
    form.addEventListener('submit', handleFormSubmit);

    // Set up model selection handler
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            selectedModel = this.value;
            window.selectedModel = selectedModel;
            loadEmbeddingsData();
        });
    }
});

// Function to load the embeddings data
async function loadEmbeddingsData() {
    try {
        // Determine which files to load based on selected model
        const embeddingsFile = selectedModel === 'vae' ? 'VAE_song_embeddings.csv' : 'song_embeddings.csv';
        
        // Load song embeddings CSV
        const embeddingsResponse = await fetch(embeddingsFile);
        const embeddingsText = await embeddingsResponse.text();
        
        // Parse the CSV to get song IDs and embeddings
        const embeddingsData = parseEmbeddingsCSV(embeddingsText);
        songEmbeddings = embeddingsData.embeddings;
        songIds = embeddingsData.songIds;
        
        console.log(`Loaded embeddings for ${songIds.length} songs using ${selectedModel === 'vae' ? 'Variational Autoencoder' : 'Autoencoder'} model`);
        
        // Enable the form
        document.getElementById('song-id').disabled = false;
        document.getElementById('recommender-form').querySelector('button').disabled = false;
    } catch (error) {
        console.error('Error loading embeddings data:', error);
        alert('Failed to load song data. Please refresh the page and try again.');
    }
}

// Function to parse the embeddings CSV
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

// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get input values
    const songId = document.getElementById('song-id').value;
    const numRecommendations = parseInt(document.getElementById('num-recommendations').value);
    
    if (!songId) {
        alert('Please enter a song ID');
        return;
    }
    
    // Show results section and loading spinner
    document.getElementById('results-section').classList.remove('d-none');
    document.getElementById('loading-spinner').classList.remove('d-none');
    document.getElementById('results-container').classList.add('d-none');
    document.getElementById('error-message').classList.add('d-none');
    
    // Set the source song ID in the results
    document.getElementById('source-song-id').textContent = songId;
    
    // Get and display recommendations
    try {
        const recommendations = await getSimilarSongs(songId, numRecommendations);
        displayRecommendations(recommendations);
        
        // Also show which model was used
        const modelName = selectedModel === 'vae' ? 'Variational Autoencoder' : 'Regular Autoencoder';
        document.getElementById('model-used').textContent = modelName;
    } catch (error) {
        console.error('Error getting recommendations:', error);
        document.getElementById('loading-spinner').classList.add('d-none');
        document.getElementById('error-message').classList.remove('d-none');
    }
}

// Make selectedModel globally accessible for api.js
window.selectedModel = selectedModel;

// Function to compute cosine similarity between two vectors
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

// Function to get recommendations for a song
function getRecommendations(songId, numRecommendations) {
    // Get the embedding for the source song
    const sourceEmbedding = songEmbeddings[songId];
    
    if (!sourceEmbedding) {
        throw new Error(`Embedding for song ID ${songId} not found.`);
    }
    
    // Calculate similarity with all other songs
    const similarities = [];
    
    for (const id of songIds) {
        if (id !== songId) {
            const targetEmbedding = songEmbeddings[id];
            const similarity = cosineSimilarity(sourceEmbedding, targetEmbedding);
            similarities.push({ songId: id, similarity });
        }
    }
    
    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Return top N recommendations
    return similarities.slice(0, numRecommendations);
}

// Function to display recommendations
function displayRecommendations(recommendations) {
    const tableBody = document.getElementById('results-table');
    tableBody.innerHTML = '';
    
    recommendations.forEach((rec, index) => {
        const row = document.createElement('tr');
        
        // Format similarity score as percentage with 2 decimal places
        const similarityPercent = (rec.similarity * 100).toFixed(2);
        
        // Create cells
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${rec.songId}</td>
            <td>
                ${similarityPercent}%
                <div class="similarity-bar" style="width: ${similarityPercent}%"></div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Hide loading spinner and show results
    document.getElementById('loading-spinner').classList.add('d-none');
    document.getElementById('results-container').classList.remove('d-none');
} 