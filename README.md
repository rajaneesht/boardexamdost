# AI Chatbot Product link : https://rajaneesht-boardexamdost-7w9x.vercel.app/

# Exam fever is ON in India! 🌟
Class 10th & 12th students (CBSE, ICSE, State Boards) are battling boards right now. Exams are tough—anxiety and nerves are real for so many.
That's why we built BoardExamDost ('your friend in exams')—a quick 15-min AI chatbot using Google's new Vertex AI Studio: https://lnkd.in/gyNtHskC

It offers quick mental well-being tips, morale boosts, and ad-hoc guidance for kids without access to mentors.

# 🔧 How We Tuned the Prompts:
Persona: "You're BoardExamDost—a kind friend for Indian board students. Help reduce panic with calm reassurance."
Tone: Warm, encouraging, easy ("You've got this. Take a breath. One step at a time.").
Grounding: Gentle reminders for sleep, water, short breaks.

# 💡 Simple Enhancements:
Panic Response: Quick calm script for "I'm panicking" or "I can't do this."
Languages: Hinglish + regional options for better reach.
Breaks: Suggest 10-min pauses, music, or stretches.


# Vertex AI Studio Frontend App with Node.js Backend

Vertex AI Studio tool - https://console.cloud.google.com/vertex-ai/studio

This repository contains a frontend and a Node.js backend, designed to run together.
The backend acts as a proxy, handling Google Cloud API calls.

This project is intended for demonstration and prototyping purposes only.
It is not intended for use in a production environment.

## Prerequisites

To run this application locally, you need:

*   **[Google Cloud SDK / gcloud CLI](https://cloud.google.com/sdk/docs/install)**: Follow the instructions to install the SDK.

*   **gcloud Initialization**:
    *   Initialize the gcloud CLI:
        ```bash
        gcloud init
        ```
    *   Authenticate for Application Default Credentials (needed to call Google Cloud APIs):
        ```bash
        gcloud auth application-default login
        ```

*   **Node.js and npm**: Ensure you have Node.js and its package manager, `npm`, installed on your machine.

## Project Structure

The project is organized into two main directories:

*   `frontend/`: Contains the Frontend application code.
*   `backend/`: Contains the Node.js/Express server code to proxy Google Cloud API calls.

## Backend Environment Variables

The `backend/.env.local` file is automatically generated when you download this application.
It contains essential Google Cloud environment variables pre-configured based on your project settings at the time of download.

The variables set in `backend/.env.local` are:
*   `API_BACKEND_PORT`: The port the backend API server listens on (e.g., `5000`).
*   `API_PAYLOAD_MAX_SIZE`: The maximum size of the request payload accepted by the backend server (e.g., `5mb`).
*   `GOOGLE_CLOUD_LOCATION`: The Google Cloud region associated with your project.
*   `GOOGLE_CLOUD_PROJECT`: Your Google Cloud Project ID.

**Note:** These variables are automatically populated during the download process.
You can modify the values in `backend/.env.local` if you need to change them.

## Installation and Running the App

To install dependencies and run your Google Cloud Vertex AI Studio App locally, execute the following command:

```bash
npm install && npm run dev
