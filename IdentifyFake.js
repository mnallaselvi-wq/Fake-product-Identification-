// Fake Product Reporting Chatbot (No-Code style JavaScript simulation) // This script can be adapted for platforms like Botsonic, Dialogflow, or Voiceflow.

import express from 'express'; import bodyParser from 'body-parser'; import { GoogleSpreadsheet } from 'google-spreadsheet'; import OpenAI from 'openai';

const app = express(); app.use(bodyParser.json());

// Initialize OpenAI for AI responses const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Connect Google Sheet (where product data is stored) const doc = new GoogleSpreadsheet(process.env.SHEET_ID); await doc.useServiceAccountAuth({ client_email: process.env.GOOGLE_CLIENT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\n/g, '\n'), }); await doc.loadInfo(); const sheet = doc.sheetsByIndex[0];

// Helper function: check authenticity async function checkProduct(barcode) { const rows = await sheet.getRows(); const product = rows.find((row) => row.Barcode === barcode); if (!product) return 'Not in database'; return product.Status; // e.g., 'Genuine' or 'Suspected Fake' }

// Endpoint for chatbot interaction app.post('/chat', async (req, res) => { const userMessage = req.body.message;

// Basic intent recognition (could be replaced with Dialogflow) if (/report|fake|suspect/i.test(userMessage)) { return res.json({ reply: 'Please share the product name, brand, barcode, and a brief description.', }); }

if (/barcode|check|verify/i.test(userMessage)) { const barcode = userMessage.match(/\d+/)?.[0]; if (!barcode) return res.json({ reply: 'Please provide the barcode number.' });

const result = await checkProduct(barcode);
if (result === 'Not in database') {
  return res.json({
    reply: 'This product is not in our database. Would you like to report it for review?',
  });
} else {
  return res.json({ reply: `This product appears to be: ${result}` });
}

}

// Default fallback (AI-generated response) const aiResponse = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [ { role: 'system', content: 'You are a friendly assistant helping users report and check fake products using barcodes.', }, { role: 'user', content: userMessage }, ], });

res.json({ reply: aiResponse.choices[0].message.content }); });

// Run server app.listen(3000, () => console.log('Fake Product Chatbot running on port 3000'));

