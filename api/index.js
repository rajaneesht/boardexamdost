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

// ─── Helpers (defined FIRST so they can be used in API_CLIENT_MAP below) ──────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePattern(pattern) {
  const paramRegex = /\{\{(.*?)\}\}/g;
  const params = [];
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = paramRegex.exec(pattern)) !== null) {
    params.push(match[1]);
    parts.push(escapeRegex(pattern.substring(lastIndex, match.index)));
    parts.push(`(?<${match[1]}>[^/]+)`);
    lastIndex = paramRegex.lastIndex;
  }
  parts.push(escapeRegex(pattern.substring(lastIndex)));
  return { regex: new RegExp(`^${parts.join('')}$`), params };
}

function extractParams(patternInfo, url) {
  const match = url.match(patternInfo.regex);
  if (!match) return null;
  const params = {};
  patternInfo.params.forEach((name, i) => { params[name] = match[i + 1]; });
  return params;
}

// ─── Environment ──────────────────────────────────────────────────────────────

const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_CLOUD_PROJECT   = process.env.GOOGLE_CLOUD_PROJECT;

if (!GOOGLE_CLOUD_PROJECT || !GOOGLE_CLOUD_LOCATION) {
  console.warn('Warning: GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION are not set. API calls will fail.');
}

// ─── Google Auth ──────────────────────────────────────────────────────────────

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  credentials: process.env.GOOGLE_PRIVATE_KEY
    ? {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }
    : undefined,
});

async function getAccessToken(res) {
  try {
    const client = await auth.getClient();
    const token  = await client.getAccessToken();
    return token.token;
  } catch (error) {
    console.error('[Proxy] Auth error:', error);
    res.status(500).json({ error: `Authentication failed: ${error.message}` });
    return null;
  }
}

function getRequestHeaders(accessToken) {
  return {
    Authorization:        `Bearer ${accessToken}`,
    'X-Goog-User-Project': GOOGLE_CLOUD_PROJECT,
    'Content-Type':        'application/json',
  };
}

// ─── API Client Map (uses parsePattern, so must come AFTER it) ────────────────

const streamTransformFn = (response) => {
  let s = response.trim();
  while (s.startsWith(',') || s.startsWith('['))  s = s.substring(1).trim();
  while (s.endsWith(',')   || s.endsWith(']'))    s = s.substring(0, s.length - 1).trim();
  if (!s.length)        return { result: null, inProgress: false };
  if (!s.endsWith('}')) return { result: s,    inProgress: true  };
  try {
    return { result: `data: ${JSON.stringify(JSON.parse(s))}\n\n`, inProgress: false };
  } catch (e) {
    throw new Error(`Failed to parse response chunk: ${e}`);
  }
};

const API_CLIENT_MAP = [
  {
    name: 'VertexGenAi:generateContent',
    patternForProxy: 'https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:generateContent',
    getApiEndpoint: (ctx, p) =>
      `https://aiplatform.clients6.google.com/${p.version}/projects/${ctx.projectId}/locations/${ctx.region}/publishers/google/models/${p.model}:generateContent`,
    isStreaming: false,
    transformFn: null,
  },
  {
    name: 'VertexGenAi:predict',
    patternForProxy: 'https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:predict',
    getApiEndpoint: (ctx, p) =>
      `https://aiplatform.clients6.google.com/${p.version}/projects/${ctx.projectId}/locations/${ctx.region}/publishers/google/models/${p.model}:predict`,
    isStreaming: false,
    transformFn: null,
  },
  {
    name: 'VertexGenAi:streamGenerateContent',
    patternForProxy: 'https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:streamGenerateContent',
    getApiEndpoint: (ctx, p) =>
      `https://aiplatform.clients6.google.com/${p.version}/projects/${ctx.projectId}/locations/${ctx.region}/publishers/google/models/${p.model}:streamGenerateContent`,
    isStreaming: true,
    transformFn: streamTransformFn,
  },
  {
    name: 'ReasoningEngine:query',
    patternForProxy: 'https://{{endpoint_location}}-aiplatform.googleapis.com/{{version}}/projects/{{project_id}}/locations/{{location_id}}/reasoningEngines/{{engine_id}}:query',
    getApiEndpoint: (ctx, p) =>
      `https://${p.endpoint_location}-aiplatform.clients6.google.com/v1beta1/projects/${p.project_id}/locations/${p.location_id}/reasoningEngines/${p.engine_id}:query`,
    isStreaming: false,
    transformFn: null,
  },
  {
    name: 'ReasoningEngine:streamQuery',
    patternForProxy: 'https://{{endpoint_location}}-aiplatform.googleapis.com/{{version}}/projects/{{project_id}}/locations/{{location_id}}/reasoningEngines/{{engine_id}}:streamQuery',
    getApiEndpoint: (ctx, p) =>
      `https://${p.endpoint_location}-aiplatform.clients6.google.com/v1beta1/projects/${p.project_id}/locations/${p.location_id}/reasoningEngines/${p.engine_id}:streamQuery`,
    isStreaming: true,
    transformFn: null,
  },
].map((client) => ({ ...client, patternInfo: parsePattern(client.patternForProxy) }));

// ─── Express App ──────────────────────────────────────────────────────────────

const app = express();

app.set('trust proxy', 1);
app.use(express.json({ limit: process.env.API_PAYLOAD_MAX_SIZE || '7mb' }));

// Rate limiter — applied to every request since on Vercel all arrive at root
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error:   'Too many requests',
      message: 'You have exceeded the request limit, please try again later.',
    },
  })
);

// ─── Proxy Handler ────────────────────────────────────────────────────────────

app.all('*', async (req, res) => {
  const { originalUrl, method, headers = {}, body } = req.body ?? {};

  if (!originalUrl) {
    return res.status(400).json({ error: 'Bad Request: originalUrl is required.' });
  }

  let extractedParams = null;
  const apiClient = API_CLIENT_MAP.find((p) => {
    extractedParams = extractParams(p.patternInfo, originalUrl);
    return extractedParams !== null;
  });

  if (!apiClient) {
    return res.status(404).json({ error: `No proxy handler found for URL: ${originalUrl}` });
  }

  try {
    const accessToken = await getAccessToken(res);
    if (!accessToken) return;

    const context = { projectId: GOOGLE_CLOUD_PROJECT, region: GOOGLE_CLOUD_LOCATION };
    const apiUrl  = apiClient.getApiEndpoint(context, extractedParams);

    // Strip hop-by-hop / sensitive headers forwarded from the client
    const { host, authorization, 'content-length': _cl, ...safeHeaders } = headers;

    const apiFetchOptions = {
      method:  method || 'POST',
      headers: { ...getRequestHeaders(accessToken), ...safeHeaders },
      body:    body != null
        ? (typeof body === 'string' ? body : JSON.stringify(body))
        : undefined,
    };

    const apiResponse = await fetch(apiUrl, apiFetchOptions);

    if (apiClient.isStreaming) {
      // Use pipeline-safe approach compatible with Vercel's Node runtime
      res.writeHead(apiResponse.status, {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      });

      const decoder = new TextDecoder();
      let deltaChunk = '';

      for await (const encodedChunk of apiResponse.body) {
        if (res.writableEnded) break;

        if (!apiClient.transformFn) {
          res.write(encodedChunk);
        } else {
          deltaChunk += decoder.decode(encodedChunk, { stream: true });
          const { result, inProgress } = apiClient.transformFn(deltaChunk);
          if (result && !inProgress) {
            deltaChunk = '';
            res.write(result);
          }
        }
      }

      res.end();
    } else {
      const data = await apiResponse.json();
      res.status(apiResponse.status).json(data);
    }
  } catch (error) {
    console.error('[Proxy] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// ─── Local Dev Server ─────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.API_BACKEND_PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Vertex AI Backend listening at http://localhost:${PORT}`);
  });
}

export default app;
