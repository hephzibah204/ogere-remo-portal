export async function onRequestGet(context) {
  const { request, env, params } = context;
  const key = params.key;

  try {
    const value = await env.OGERE_KV.get(key);
    if (value === null) {
      return new Response(JSON.stringify({ error: "Not found", data: null }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ data: JSON.parse(value) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestPut(context) {
  const { request, env, params } = context;
  const key = params.key;

  try {
    const body = await request.json();
    await env.OGERE_KV.put(key, JSON.stringify(body.data));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const key = params.key;

  try {
    await env.OGERE_KV.delete(key);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
