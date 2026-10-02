export async function sendAnthropicMessage(system, userContent) {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'anthropic',
        system,
        userContent,
      }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.content || null;
  } catch {
    return null;
  }
}
