# CS7180_ewaste-idea-generator-project

## Overview

The **Electronic Waste Idea Generator** is a project that generates innovative ideas for reusing electronic waste (e-waste). It takes input materials (such as old phone screens and circuit boards) and uses AI models to generate ideas for their reuse. The generated ideas are presented with details on functionality, manufacturing methods, environmental benefits, safety considerations, target users, and usage scenarios.

### Project Structure

The project consists of the following main components:

1. **Backend (Server)**: A Node.js Express server that interacts with an AI model API (OpenRouter) to generate reuse ideas. It handles the requests from the frontend and processes the data.
   
   - `server.js`: Main backend script that sets up the server and API calls.
   - `public/`: Static directory where the frontend files (HTML) are served.

2. **Frontend**: A simple web interface where users can input materials and generate reuse ideas. The frontend communicates with the backend server via HTTP requests.

   - `index.html`: The HTML file for the user interface.

3. **Environment Variables**: The project uses a `.env` file to store sensitive information such as API keys.

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ewaste-idea-generator.git
   cd ewaste-idea-generator

2. **Install dependencies**:
   Backend (Node.js dependencies):
   ```bash
   npm install

4. **Start the server**:   
   ```bash
   npm start   
   The server will run at http://localhost:3000.

## Libraries/Packages Used
### Backend (Node.js):
    express (v4.17.1): A web framework for Node.js used to set up the server.
    axios (v0.24.0): A promise-based HTTP client for making requests to the AI model API.
    dotenv (v10.0.0): A zero-dependency module that loads environment variables from a .env file.
    cors (v2.8.5): A package for enabling Cross-Origin Resource Sharing (CORS) to allow frontend-backend communication.

### Frontend:

    HTML: Standard web markup.

## Usage
    1. Open the web page at http://localhost:3000.
    2. Enter materials like "old phone screens + circuit boards" into the input field.
    3. Click the "Generate Idea" button to receive a creative reuse idea for those materials.
    
    The result will include details such as title, functionality, manufacturing method, environmental benefits, and more.


