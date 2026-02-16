# BoardExamDost - Student Wellness Companion

A React-based wellness chatbot for students, designed to provide anxiety relief, study tips, and motivation.

## 🚀 Quick Deployment

You can deploy this application to the cloud for free using Vercel or Netlify.

### Option 1: Deploy to Vercel (Recommended)

1.  **Push to GitHub**: Initialize a git repository and push this code to GitHub.
2.  **Go to Vercel**: Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3.  **Import Repository**: Select your `board-exam-dost` repository.
4.  **Configure Project**:
    *   Framework Preset: `Vite` (should be detected automatically).
    *   Root Directory: `./`
5.  **Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Key: `VITE_API_KEY`
    *   Value: Your Google Gemini API Key (get it from [aistudio.google.com](https://aistudio.google.com)).
6.  **Deploy**: Click **"Deploy"**.

### Option 2: Deploy to Netlify

1.  **Push to GitHub**: Push your code to GitHub.
2.  **Go to Netlify**: Log in to [netlify.com](https://netlify.com) and click **"Add new site"** > **"Import from existing project"**.
3.  **Connect GitHub**: Select your repository.
4.  **Build Settings**:
    *   Build command: `npm run build`
    *   Publish directory: `dist`
5.  **Environment Variables**:
    *   Click "Show advanced" or go to "Site settings" > "Environment variables" after creation.
    *   Key: `VITE_API_KEY`
    *   Value: Your Google Gemini API Key.
6.  **Deploy**: Click **"Deploy site"**.

## 🛠 Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env` file in the root directory:
    ```
    VITE_API_KEY=your_actual_api_key_here
    ```
3.  Start the server:
    ```bash
    npm run dev
    ```
