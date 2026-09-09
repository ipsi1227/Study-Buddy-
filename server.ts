import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API endpoint: Generate high-yield topic notes for notebook transcription + expected questions
  app.post('/api/generate-notes', async (req, res) => {
    try {
      const { topic, content, subjectName } = req.body;
      const topicTitle = (topic && typeof topic === 'string' && topic.trim()) ? topic.trim() : 'Pasted Lecture Notes';
      const rawNotes = (content && typeof content === 'string') ? content.trim() : '';

      if (!topicTitle && !rawNotes) {
        return res.status(400).json({ error: 'Topic or notes content is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          fallback: true,
          message: 'GEMINI_API_KEY not configured, using offline knowledge engine',
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = rawNotes
        ? `You are an expert Computer Science professor helping a college student prepare concise revision notes directly from their current notes, textbook excerpts, or lecture text.

Topic/Header: "${topicTitle}"
Subject Context: "${subjectName || 'Computer Science & Engineering'}"

STUDENT'S CURRENT PASTED NOTES:
"""
${rawNotes.slice(0, 8000)}
"""

Carefully analyze the student's pasted notes above. The student wants to write these notes into their physical notebook in clear points, understand a clean summary, and practice expected exam questions.
Provide a high-quality JSON response strictly with this structure:
{
  "title": "${topicTitle}",
  "summary": "2-3 sentence clear summary of the core concepts, objectives, and importance explained in the student's pasted notes.",
  "points": [
    {
      "id": "p-1",
      "category": "Key Concept & Definition",
      "point": "Clear concise definition to write in notebook extracted directly from the notes."
    },
    {
      "id": "p-2",
      "category": "Key Concept & Definition",
      "point": "Second core concept point."
    },
    {
      "id": "p-3",
      "category": "How It Works / Mechanism",
      "point": "Step-by-step mechanism or process explained in the notes."
    },
    {
      "id": "p-4",
      "category": "How It Works / Mechanism",
      "point": "Second mechanism or execution step point."
    },
    {
      "id": "p-5",
      "category": "Formulas, Invariants & Complexity",
      "point": "Formulas, mathematical properties, or Big-O complexity bounds mentioned in or relevant to the notes."
    },
    {
      "id": "p-6",
      "category": "Formulas, Invariants & Complexity",
      "point": "Key rule or invariant."
    },
    {
      "id": "p-7",
      "category": "Exam Pointers & Traps",
      "point": "Important takeaways or common exam pitfalls to avoid."
    },
    {
      "id": "p-8",
      "category": "Exam Pointers & Traps",
      "point": "High-yield memory anchor for university exams."
    }
  ],
  "expectedQuestions": [
    {
      "id": "q-1",
      "marks": "2 Marks",
      "question": "Short definition or basic condition question based on the notes",
      "answer": "Concise, full-marks model answer based on the notes"
    },
    {
      "id": "q-2",
      "marks": "5 Marks",
      "question": "Working mechanism, process, or comparison question",
      "answer": "Step-by-step model answer based on the notes"
    },
    {
      "id": "q-3",
      "marks": "10 Marks",
      "question": "Comprehensive algorithm, derivation, or numerical problem question",
      "answer": "Thorough structured model answer"
    },
    {
      "id": "q-4",
      "marks": "Viva / Interview",
      "question": "Oral exam question directly testing understanding of the core concept in the notes",
      "answer": "Crisp answer highlighting key trade-offs"
    }
  ]
}
Return ONLY valid JSON matching this schema. Provide 8 to 12 strong, actionable bullet points directly reflecting the student's pasted notes.`
        : `You are an expert Computer Science professor helping a college student prepare concise revision notes.
Topic: "${topicTitle}"
Subject Context: "${subjectName || 'Computer Science & Engineering'}"

The student needs to copy these notes into their physical notebook, so every note point must be crisp, clear, and high-yield.
Provide a high-quality JSON response strictly with this structure:
{
  "title": "${topicTitle}",
  "summary": "2-3 sentences clearly defining what this concept is, its primary objective, and why it is essential.",
  "points": [
    {
      "id": "p-1",
      "category": "Key Concept & Definition",
      "point": "Clear concise definition to write in notebook."
    },
    {
      "id": "p-2",
      "category": "Key Concept & Definition",
      "point": "Second core concept point."
    },
    {
      "id": "p-3",
      "category": "How It Works / Mechanism",
      "point": "Step-by-step mechanism point 1."
    },
    {
      "id": "p-4",
      "category": "How It Works / Mechanism",
      "point": "Step-by-step mechanism point 2."
    },
    {
      "id": "p-5",
      "category": "Formulas, Invariants & Complexity",
      "point": "Formulas, invariants, or Big-O complexity bounds."
    },
    {
      "id": "p-6",
      "category": "Formulas, Invariants & Complexity",
      "point": "Key algorithmic or mathematical rule."
    },
    {
      "id": "p-7",
      "category": "Exam Pointers & Traps",
      "point": "High-yield takeaway or common exam trap where marks get deducted."
    },
    {
      "id": "p-8",
      "category": "Exam Pointers & Traps",
      "point": "Quick memory anchor or shortcut for university exams."
    }
  ],
  "expectedQuestions": [
    {
      "id": "q-1",
      "marks": "2 Marks",
      "question": "Short definition or basic condition question",
      "answer": "Concise, full-marks model answer"
    },
    {
      "id": "q-2",
      "marks": "5 Marks",
      "question": "Explanation, comparison, or algorithm working question",
      "answer": "Step-by-step model answer"
    },
    {
      "id": "q-3",
      "marks": "10 Marks",
      "question": "Comprehensive derivation, numerical scenario, or detailed algorithm question",
      "answer": "Thorough structured model answer"
    },
    {
      "id": "q-4",
      "marks": "Viva / Interview",
      "question": "Common oral exam or technical interview question on this topic",
      "answer": "Crisp, precise answer highlighting the underlying trade-off or invariant"
    }
  ]
}
Return ONLY valid JSON matching this schema. Provide 8 to 12 strong, actionable bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      return res.json({
        success: true,
        data: parsed,
        source: 'gemini-ai',
      });
    } catch (err: any) {
      console.error('Gemini notes generation error:', err);
      return res.json({
        fallback: true,
        error: err.message || 'Gemini error, fallback to local engine',
      });
    }
  });

  // API endpoint: Send / dispatch task reminder email
  app.post('/api/send-email', (req, res) => {
    try {
      const { email, uncompletedTodos } = req.body;
      const count = Array.isArray(uncompletedTodos) ? uncompletedTodos.length : 0;
      console.log(`[Task Reminder] Email notification processed for ${email} with ${count} unfinished tasks.`);

      return res.json({
        success: true,
        email,
        taskCount: count,
        dispatchedAt: new Date().toISOString(),
        message: `Task reminder digest generated for ${email}`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Study Buddy full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
