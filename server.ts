/**
 * CyberSentinel X - Server-Side Security Proxy & Full-Stack Entry Point
 * Handles server-side Gemini API calls via @google/genai SDK, mounts Express routes,
 * and attaches Vite middlewares on port 3000.
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import {
  SENTINEL_AI_SYSTEM_PROMPT,
  buildCorrectionPrompt,
  buildExecutiveSummaryPrompt,
  buildIncidentAnalysisPrompt,
  buildOperatorQuestionPrompt
} from './src/ai/promptBuilder';
import { validateAIAnalysisSchema } from './src/ai/schemas';
import {
  getDeterministicFallbackAnalysis,
  createFallbackQuestionAnswer,
  getDeterministicFallbackSummary
} from './src/ai/geminiProvider';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));

// -------------------------------------------------------------
// GET /api/health - Lightweight Health Endpoint
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'cybersentinel-x'
  });
});

// Initialize GoogleGenAI SDK on the server with recommended httpOptions
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// -------------------------------------------------------------
// POST /api/ai/analyze - Evidence-Grounded Security Analysis
// -------------------------------------------------------------
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  const { packet } = req.body;

  if (!packet) {
    res.status(400).json({ error: 'Missing EvidencePacket in request body' });
    return;
  }

  // If Gemini client is not initialized, immediately provide deterministic evidence-grounded analysis
  if (!aiClient) {
    const fallback = getDeterministicFallbackAnalysis(packet);
    res.json({
      ...fallback,
      isDemoFallback: true,
      modelUsed: 'DEMO ANALYSIS'
    });
    return;
  }

  try {
    const prompt = buildIncidentAnalysisPrompt(packet);

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SENTINEL_AI_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const rawText = response.text || '{}';
    let parsed: any;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      // 1-retry with correction instruction
      const correctionPrompt = buildCorrectionPrompt(rawText, ['Malformed JSON string output']);
      const retryResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: correctionPrompt,
        config: {
          systemInstruction: SENTINEL_AI_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.0
        }
      });
      parsed = JSON.parse(retryResponse.text || '{}');
    }

    const validation = validateAIAnalysisSchema(parsed);
    if (!validation.valid) {
      console.warn('[Sentinel AI] Analysis schema validation notice, serving validated fallback:', validation.errors);
      const fallback = getDeterministicFallbackAnalysis(packet);
      res.json({
        ...fallback,
        isDemoFallback: true,
        modelUsed: 'DEMO ANALYSIS'
      });
      return;
    }

    res.json({
      ...parsed,
      isDemoFallback: false,
      modelUsed: 'gemini-3.8-flash'
    });
  } catch (err: any) {
    // Quota limits (429 RESOURCE_EXHAUSTED) or connectivity must never break the SOC demo
    console.warn('[Sentinel AI] Advisory quota / API notice, serving deterministic evidence analysis:', err?.message || String(err));
    const fallback = getDeterministicFallbackAnalysis(packet);
    res.json({
      ...fallback,
      isDemoFallback: true,
      modelUsed: 'DEMO ANALYSIS'
    });
  }
});

// -------------------------------------------------------------
// POST /api/ai/ask - Operator Security Questions
// -------------------------------------------------------------
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  const { packet, question } = req.body;

  if (!packet || !question) {
    res.status(400).json({ error: 'Missing packet or question' });
    return;
  }

  if (!aiClient) {
    res.json(createFallbackQuestionAnswer(packet, question));
    return;
  }

  try {
    const prompt = buildOperatorQuestionPrompt(packet, question);

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SENTINEL_AI_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.warn('[Sentinel AI] Advisory question notice, serving grounded answer:', err?.message || String(err));
    res.json(createFallbackQuestionAnswer(packet, question));
  }
});

// -------------------------------------------------------------
// POST /api/ai/summary - Executive Briefing
// -------------------------------------------------------------
app.post('/api/ai/summary', async (req: Request, res: Response) => {
  const { packet } = req.body;

  if (!packet) {
    res.status(400).json({ error: 'Missing packet' });
    return;
  }

  if (!aiClient) {
    res.json(getDeterministicFallbackSummary(packet));
    return;
  }

  try {
    const prompt = buildExecutiveSummaryPrompt(packet);

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SENTINEL_AI_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      ...parsed,
      isDemoFallback: false
    });
  } catch (err: any) {
    console.warn('[Sentinel AI] Summary briefing notice, serving grounded briefing:', err?.message || String(err));
    res.json(getDeterministicFallbackSummary(packet));
  }
});

// -------------------------------------------------------------
// Vite middleware mounting (dev) or Static serving (production)
// -------------------------------------------------------------
async function startServer() {
  // Return JSON 404 for any unhandled /api/* routes
  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Endpoint not found',
      service: 'cybersentinel-x'
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CyberSentinel X] Server running on port ${PORT} (mode: ${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
