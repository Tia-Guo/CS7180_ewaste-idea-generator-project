require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const open = require('open').default;

const app = express();
const PORT = process.env.PORT || 3000;

// OpenRouter configuration
const OPENROUTER_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.REFERRER_URL || 'http://localhost:3000', 
    'X-Title': process.env.APP_NAME || 'RecycleAI', 
    'Content-Type': 'application/json'
  }
};

// Supported model list (expandable)
const MODELS = {
  'claude-3-haiku': 'anthropic/claude-3-haiku',
  'gpt-4': 'openai/gpt-4',
  'llama3-70b': 'meta-llama/llama-3-70b-instruct',
  'mixtral': 'mistralai/mixtral-8x7b-instruct'
};

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Enhanced field extractor
function extractField(text, field) {
  const patterns = [
    new RegExp(`${field}:\\s*([\\s\\S]*?)(?=\\n[\\w\\s]+:|$)`),
    new RegExp(`"${field}":\\s*"([^"]*)"`),
    new RegExp(`【${field}】([\\s\\S]*?)(?=【|$)`)
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim().replace(/\n+/g, ' ');
  }
  return 'No data provided';
}

async function generateIdea(materials, model = 'claude-3-haiku') {
  const prompt = `Generate an innovative reuse plan based on the materials: ${materials}. Please include the following fields:
  - Title: A concise, creative title for the reuse idea.
  - Functionality: The functionality of the reuse idea.
  - Manufacturing Method: The method used for manufacturing the reuse idea.
  - Environmental Benefits: The environmental benefits.
  - Safety: Safety considerations.
  - Applicable Users: The target users for this idea.
  - Usage Scenarios: The scenarios where this idea can be used.

  Make sure to only provide content for each of these fields in the requested format, and avoid extra information or unrelated text.`;

  try {
    const response = await axios.post(
      `${OPENROUTER_CONFIG.baseURL}/chat/completions`,
      {
        model: MODELS[model],
        messages: [
          { role: 'system', content: 'You are an environmental engineer skilled at turning waste into useful products.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' } 
      },
      {
        headers: OPENROUTER_CONFIG.headers,
        timeout: 20000 // 20s timeout
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('Raw response:', content);

    try {
      const result = JSON.parse(content);
      const requiredFields = ['title', 'functionality', 'manufacturing', 'benefits', 'safety', 'users', 'scenarios'];
      if (requiredFields.every(field => field in result)) {
        return result;
      }
      throw new Error('Incomplete response fields');
    } catch (jsonError) {
      console.warn('Failed to parse JSON, attempting text extraction:', jsonError.message);
      return {
        title: extractField(content, 'Title'),
        functionality: extractField(content, 'Functionality'),
        manufacturing: extractField(content, 'Manufacturing Method'),
        benefits: extractField(content, 'Environmental Benefits'),
        safety: extractField(content, 'Safety'),
        users: extractField(content, 'Applicable Users'),
        scenarios: extractField(content, 'Usage Scenarios')
      };
    }

  } catch (error) {
    console.error('OpenRouter error:', error.response?.data || error.message);
    
    const errorInfo = {
      401: { code: 401, message: 'Invalid API key' },
      402: { code: 402, message: 'Payment required' },
      429: { code: 429, message: 'Too many requests' },
      503: { code: 503, message: 'Model temporarily unavailable' }
    }[error.response?.status] || { code: 500, message: 'Generation failed' };

    return { 
      error: errorInfo.message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      model: MODELS[model]
    };
  }
}

app.post('/generate', async (req, res) => {
  const { materials, model } = req.body;

  if (!materials || typeof materials !== 'string' || materials.length > 200) {
    return res.status(400).json({ error: 'Invalid input materials' });
  }

  const safeModel = Object.keys(MODELS).includes(model) ? model : 'claude-3-haiku';
  
  try {
    const result = await generateIdea(materials, safeModel);
    const responseData = result.error ? null : {
      title: result.title,
      functionality: result.functionality,
      manufacturing: result.manufacturing,
      benefits: result.benefits,
      safety: result.safety,
      users: result.users,
      scenarios: result.scenarios
    };
    res.status(result.error ? 500 : 200).json({
      success: !result.error,
      data: responseData,
      error: result.error || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: 'Internal server error'
    });
  }
});


app.listen(PORT, () => {
  console.log(`✅ OpenRouter service running at: http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});
