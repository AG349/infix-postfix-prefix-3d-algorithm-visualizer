import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { convertExpression } from './utils/ExpressionParser.js';
import { ConversionRequest, ConversionRoute } from './types/parser.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for cross-origin requests from Next.js frontend
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Health Check Endpoint for Render / Railway Cloud Checks
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    service: 'Expression Visualizer Math API Engine',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Primary Conversion Endpoint
app.post('/api/convert', (req: Request<{}, {}, ConversionRequest>, res: Response) => {
  try {
    const { expression, route } = req.body;

    if (!expression || typeof expression !== 'string') {
      return res.status(400).json({
        success: false,
        errorMessage: 'Invalid request: "expression" string parameter is required.',
      });
    }

    const validRoutes: ConversionRoute[] = [
      'INFIX_TO_POSTFIX',
      'INFIX_TO_PREFIX',
      'POSTFIX_TO_INFIX',
      'POSTFIX_TO_PREFIX',
      'PREFIX_TO_INFIX',
      'PREFIX_TO_POSTFIX',
    ];

    if (!route || !validRoutes.includes(route)) {
      return res.status(400).json({
        success: false,
        errorMessage: `Invalid route parameter. Supported routes: ${validRoutes.join(', ')}`,
      });
    }

    const result = convertExpression(expression, route);

    if (!result.validation.isValid) {
      return res.status(422).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('API Error in /api/convert:', error);
    return res.status(500).json({
      success: false,
      errorMessage: error.message || 'Internal Math Engine Error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Expression Visualizer API server running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👉 Conversion endpoint: POST http://localhost:${PORT}/api/convert`);
});
