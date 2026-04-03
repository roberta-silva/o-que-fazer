import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { location, date, type, extras } = await req.json();

    if (!location || !date) {
      return NextResponse.json(
        { error: 'Local e data são obrigatórios.' },
        { status: 400 },
      );
    }

    const prompt = `Você é um guia de turismo. Responda APENAS com JSON válido, sem texto extra.

Local: ${location}
Data: ${date}
Tipo: ${type || 'qualquer coisa'}
${extras ? `Extras: ${extras}` : ''}

JSON esperado (5 itens, descrições curtas, máximo 80 caracteres cada):
{"atividades":[{"nome":"Nome","categoria":"Cat","descricao":"Frase curta.","dica":"Dica curta."}]}`;

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Resposta vazia da API');

    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
