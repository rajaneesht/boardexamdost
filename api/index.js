/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import 'dotenv/config';
import express from 'express';
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import rateLimit from 'express-rate-limit';

const app = express();

// Vercel uses body-parser internally, but this is fine for local/serverless consistency
app.use(express.json({limit: process?.env?.API_PAYLOAD_MAX_SIZE || "7mb"}));

const GOOGLE_CLOUD_LOCATION = process?.env?.GOOGLE_CLOUD_LOCATION;
const GOOGLE_CLOUD_PROJECT = process?.env?.GOOGLE_CLOUD_PROJECT;

// RELAXED CHECK: Don't kill the process on Vercel build, just log error.
if (!GOOGLE_CLOUD_PROJECT || !GOOGLE_CLOUD_LOCATION) {
  console.warn("Warning: GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION are not set. API calls will fail.");
}

app.set('trust proxy', 1);

const proxyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests',
      message: 'You have exceed the request limit, please try again later.'
    },
});

app.use('/api-proxy', proxyLimiter);

// --- API CLIENT MAP (Kept as is) ---
const API_CLIENT_MAP = [
  {
    name: "VertexGenAi:generateContent",
    patternForProxy: "https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:generateContent",
    getApiEndpoint: (context, params) => {
      return `https://aiplatform.clients6.google.com/${params['version']}/projects/${context.projectId}/locations/${context.region}/publishers/google/models/${params['model']}:generateContent`;
    },
    isStreaming: false,
    transformFn: null,
  },
  {
    name: "VertexGenAi:predict",
    patternForProxy: "https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:predict",
    getApiEndpoint: (context, params) => {
      return `https://aiplatform.clients6.google.com/${params['version']}/projects/${context.projectId}/locations/${context.region}/publishers/google/models/${params['model']}:predict`;
    },
    isStreaming: false,
    transformFn: null,
  },
  {
    name: "VertexGenAi:streamGenerateContent",
    patternForProxy: "https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:streamGenerateContent",
    getApiEndpoint: (context, params) => {
      return `https://aiplatform.clients6.google.com/${params['version']}/projects/${context.projectId}/locations/${context.region}/publishers/google/models/${params['model']}:streamGenerateContent`;
    },
    isStreaming: true,
    transformFn: (response) => {
        let normalizedResponse = response.trim();
        while (normalizedResponse.startsWith(',') || normalizedResponse.startsWith('[')) {
          normalizedResponse = normalizedResponse.substring(1).trim();
        }
        while (normalizedResponse.endsWith(',') || normalizedResponse.endsWith(']')) {
          normalizedResponse = normalizedResponse.substring(0, normalizedResponse.length - 1).trim();
        }
        if (!normalizedResponse.length) return {result: null, inProgress: false};
        if (!normalizedResponse.endsWith('}')) return {result: normalizedResponse, inProgress: true};
        try {
          const parsedResponse = JSON.parse(`${normalizedResponse}`);
          const transformedResponse = `data: ${JSON.stringify(parsedResponse)}\n\n`;
          return {result: transformedResponse, inProgress: false};
        } catch (error) {
          throw new Error(`Failed to parse response: ${error}.`);
        }
    },
  },
  {
    name: "ReasoningEngine:query",
    patternForProxy: "https://{{endpoint_location}}-aiplatform.googleapis.com/{{version}}/projects/{{project_id}}/locations/{{location_id}}/reasoningEngines/{{engine_id}}:query",
    getApiEndpoint: (context, params) => {
      return `https://${params['endpoint_location']}-aiplatform.clients6.google.com/v1beta1/projects/${params['project_id']}/locations/${params['location_id']}/reasoningEngines/${params['engine_id']}:query`;
    },
    isStreaming: false,
    transformFn: null,
  },
  {
    name: "ReasoningEngine:streamQuery",
    patternForProxy: "https://{{endpoint_location}}-aiplatform.googleapis.com/{{version}}/projects/{{project_id}}/locations/{{location_id}}/reasoningEngines/{{engine_id}}:streamQuery",
    getApiEndpoint: (context, params) => {
      return `https://${params['endpoint_location']}-aiplatform.clients6.google.com/v1beta1/projects/${params['project_id']}/locations/${params['location_id']}/reasoningEngines/${params['engine_id']}:streamQuery`;
    },
    isStreaming: true,
    transformFn: null,
  },
].map((client) => ({ ...client, patternInfo: parsePattern(client.patternForProxy) }));

// --- Google Auth Configuration ---
// On Vercel, it's better to provide credentials via env variables directly
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  // Vercel handles the credentials if you provide GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY
  credentials: process.env.GOOGLE_PRIVATE_KEY ? {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  } : undefined,
});

function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function parsePattern(pattern) {
  const paramRegex = /\{\{(.*?)\}\}/g;
  const params = [];
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = paramRegex.exec(pattern)) !== null) {
    params.push(match[1]);
    const literalPart = pattern.substring(lastIndex, match.index);
    parts.push(escapeRegex(literalPart));
    parts.push(`(?<${match[1]}>[^/]+)`);
    lastIndex = paramRegex.lastIndex;
  }
  parts.push(escapeRegex(pattern.substring(lastIndex)));
  const regexString = parts.join('');
  return {regex: new RegExp(`^${regexString}$`), params};
}

function extractParams(patternInfo, url) {
  const match = url.match(patternInfo.regex);
  if (!match) return null;
  const params = {};
  patternInfo.params.forEach((paramName, index) => {
    params[paramName] = match[index + 1];
  });
  return params;
}

async function getAccessToken(res) {
  try {
    const authClient = await auth.getClient();
    const token = await authClient.getAccessToken();
    return token.token;
  } catch (error) {
    console.error('[Node Proxy] Authentication error:', error);
    res.status(500).json({ error: `Authentication failed: ${error.message}` });
    return null;
  }
}

function getRequestHeaders(accessToken) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'X-Goog-User-Project': GOOGLE_CLOUD_PROJECT,
    'Content-Type': 'application/json',
  };
}

// --- Proxy Endpoint ---
app.post('*', async (req, res) => {
  if (req.headers['x-app-proxy'] !== 'local-vertex-ai-app' && process.env.NODE_ENV !== 'production') {
     // Optional: You might want to remove this check or allow Vercel's production URL
  }

  const { originalUrl, method, headers, body } = req.body;
  if (!originalUrl) return res.status(400).send('Bad Request: originalUrl is required.');

  const apiClient = API_CLIENT_MAP.find(p => {
    req.extractedParams = extractParams(p.patternInfo, originalUrl);
    return req.extractedParams !== null;
  });

  if (!apiClient) return res.status(404).json({ error: `No proxy handler found for URL: ${originalUrl}` });

  try {
    const accessToken = await getAccessToken(res);
    if (!accessToken) return;

    const context = {projectId: GOOGLE_CLOUD_PROJECT, region: GOOGLE_CLOUD_LOCATION};
    const apiUrl = apiClient.getApiEndpoint(context, req.extractedParams);
    const apiHeaders = getRequestHeaders(accessToken);

    const apiFetchOptions = {
      method: method || 'POST',
      headers: {...apiHeaders, ...headers},
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    };

    const apiResponse = await fetch(apiUrl, apiFetchOptions);

    if (apiClient.isStreaming) {
      res.writeHead(apiResponse.status, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const decoder = new TextDecoder();
      let deltaChunk = '';
      
      apiResponse.body.on('data', (encodedChunk) => {
        if (res.writableEnded) return;
        if (!apiClient.transformFn) {
          res.write(encodedChunk);
        } else {
          const decodedChunk = decoder.decode(encodedChunk, { stream: true });
          deltaChunk += decodedChunk;
          const {result, inProgress} = apiClient.transformFn(deltaChunk);
          if (result && !inProgress) {
            deltaChunk = '';
            res.write(result);
          }
        }
      });

      apiResponse.body.on('end', () => res.end());
    } else {
      const data = await apiResponse.json();
      res.status(apiResponse.status).json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- VERCEL COMPATIBILITY ---
// Only listen if running locally. On Vercel, the app is exported.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process?.env?.API_BACKEND_PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Vertex AI Backend listening at http://localhost:${PORT}`);
  });
}

export default app;
