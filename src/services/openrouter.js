export async function sendOpenRouterMessage(system, userContent, model = 'openai/gpt-4o-mini') {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openrouter',
        system,
        userContent,
        model,
      }),
    });

    if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
    const data = await res.json();
    return data.content || null;
  } catch {
    return null;
  }
}

export async function sendChatMessages(messages, model = 'openai/gpt-4o-mini') {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openrouter',
        messages,
        model,
      }),
    });

    if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
    const data = await res.json();
    return data.content || null;
  } catch {
    return null;
  }
}