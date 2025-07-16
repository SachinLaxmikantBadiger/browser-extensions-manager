// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json({ limit: '5mb' })); // Allow larger JSON payloads for HTML

// API Endpoint
app.post('/api/find-locator', async (req, res) => {
    const { htmlContent } = req.body;

    if (!htmlContent) {
        return res.status(400).json({ error: 'htmlContent is required' });
    }

    try {
        const prompt = `
            Based on the following HTML snippet of a target element and its surroundings, generate the most robust, readable, and unique CSS selector for the **target element**, which is the one in the middle of the provided context.

            Prioritize selectors in this order:
            1. Unique and meaningful IDs (e.g., #submit-button).
            2. Data attributes specific to testing (e.g., [data-testid="login-form"]).
            3. A combination of readable class names.
            4. A clear tag and attribute combination.
            5. Avoid overly specific, brittle selectors like long chains of child selectors (div > div > span).
            
            Return ONLY the CSS selector as a raw string, and nothing else.

            HTML Snippet:
            \`\`\`html
            ${htmlContent}
            \`\`\`
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Or 'gpt-4' for higher quality
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2, // Lower temperature for more deterministic results
            max_tokens: 100,
        });

        const locator = response.choices[0].message.content.trim();
        res.json({ locator });

    } catch (error) {
        console.error('Error with OpenAI API:', error);
        res.status(500).json({ error: 'Failed to generate locator' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});