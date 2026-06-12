const axios = require('axios');

const callOpenRouter = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_MODEL || 'google/gemini-2.0-flash-001';

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://localhost:3000',
          'X-Title': 'Temporal Displacement Protocol'
        }
      }
    );

    let contentStr = response.data.choices[0].message.content;
    // Some models wrap JSON in markdown fences despite response_format
    contentStr = contentStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    return JSON.parse(contentStr);
  } catch (error) {
    console.error('OpenRouter integration error:', error.response?.data || error.message);
    throw new Error('LLM call failed to proceed temporal iteration');
  }
};

module.exports = { callOpenRouter };
