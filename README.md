# Music Recommender System

A web-based music recommendation system that uses audio feature embeddings to find similar songs. Website is [https://georgevassilakis.github.io/ds4440_final/](https://georgevassilakis.github.io/ds4440_final/)

## Overview

This project creates a music recommendation system by analyzing audio features extracted from songs. The system uses dimensionality reduction through an autoencoder neural network to generate compact song embeddings, which are then used to compute similarity scores between songs.

## How It Works

1. **Audio Feature Extraction**: Various acoustic features were extracted from the songs, including MFCCs, energy, spectral centroid, spectral flux, fundamental frequency, and psychoacoustic sharpness.

2. **Embedding Generation**: An autoencoder neural network was trained to reduce these features to 16-dimensional embeddings that capture the essence of each song.

3. **Similarity Calculation**: Cosine similarity was computed between embeddings to measure song similarity.

4. **Web Interface**: This repository hosts a web interface for making song recommendations based on similarity scores.

## Website Usage

Visit the GitHub Pages site at `https://georgevassilakis.github.io/ds4440_final/` to use the music recommender system.

1. Enter a song ID (e.g., 286) in the input field
2. Select the number of recommendations you want to see
3. Click "Get Recommendations" to see the most similar songs

## Project Structure

- `index.html`: Main web interface
- `css/style.css`: Styling for the website
- `js/app.js`: JavaScript code to handle the recommendation functionality
- `song_embeddings.csv`: Pre-computed song embeddings (16 dimensions per song)
- `similarity_matrix.csv`: Pre-computed similarity scores between all songs

## Technical Details

- **Data Processing**: Python, NumPy, Pandas
- **Feature Extraction**: Audio signal processing techniques
- **Model**: PyTorch autoencoder neural network
- **Web Interface**: HTML, CSS, JavaScript, Bootstrap
- **Visualization**: D3.js

## Development

### Local Development

To run this website locally:

1. Clone the repository
2. Navigate to the repository folder
3. Open `index.html` in a web browser

### GitHub Pages Deployment

This project is set up to be deployed on GitHub Pages from the `main` branch. Any changes pushed to the main branch will be automatically deployed to the website.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
