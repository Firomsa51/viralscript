import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

router.get('/debug-groq', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  
  let result = '<h1>Groq API Debug</h1>';
  result += `<p>GROQ_API_KEY is ${apiKey ? 'SET (first 10 chars: ' + apiKey.substring(0,10) + '...)' : 'NOT SET'}</p>`;
  
  if (!apiKey) {
    result += '<p style="color:red">Error: Missing API key. Please set GROQ_API_KEY in environment.</p>';
    return res.send(result);
  }
  
  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "API works!"' }],
      model: 'llama3-8b-8192',
    });
    const reply = completion.choices[0]?.message?.content;
    result += `<p style="color:green">✅ API call succeeded! Response: ${reply}</p>`;
  } catch (err: any) {
    result += `<p style="color:red">❌ API call failed: ${err.message}</p>`;
    result += `<pre>${err.stack || ''}</pre>`;
  }
  
  res.send(result);
});

export default router;
