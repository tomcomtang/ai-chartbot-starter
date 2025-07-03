// AI API 请求模块

async function fetchDeepseekResponse(text, messages) {
  let aiContent = "";
  let aiReasoning = "";
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ***REMOVED***85440b9e9dd145e1a200cf188e98f499"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7
      })
    });
    const data = await res.json();
    console.log('DeepSeek response:', data);
    const content = data.choices?.[0]?.message?.content || "[No response]";
    // 解析 Reasoning 和 Answer
    const reasoningMatch = content.match(/Reasoning:(.*?)(?:Answer:|$)/s);
    const answerMatch = content.match(/Answer:(.*)/s);
    aiReasoning = reasoningMatch ? reasoningMatch[1].trim() : "";
    aiContent = answerMatch ? answerMatch[1].trim() : content;
  } catch (e) {
    aiContent = "[Error contacting AI service]";
    aiReasoning = e.message || "[Unknown error]";
    console.error(e);
  }
  return { aiContent, aiReasoning };
}

async function fetchNebiusResponse(text) {
  let aiContent = "";
  let aiReasoning = "";
  try {
    const res = await fetch("https://studio.nebius.com/api/your-endpoint", {
      method: "POST",
      headers: {
        "Authorization": "Bearer ***REMOVED***OiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnaXRodWJ8MjI3ODM5MTIiLCJzY29wZSI6Im9wZW5pZCBvZmZsaW5lX2FjY2VzcyIsImlzcyI6ImFwaV9rZXlfaXNzdWVyIiwiYXVkIjpbImh0dHBzOi8vbmViaXVzLWluZmVyZW5jZS5ldS5hdXRoMC5jb20vYXBpL3YyLyJdLCJleHAiOjE5MDkyMTQwNzUsInV1aWQiOiJlNzM1MzM1YS0zZWI3LTRlMzMtYWJkMi0zYzM4ZWYyZjY2ZjgiLCJuYW1lIjoiY2hhc2V0b255IiwiZXhwaXJlc19hdCI6IjIwMzAtMDctMDJUMDk6MTQ6MzUrMDAwMCJ9.JojSM4YOYO40aCfP9JAR4c9CZSotsoaZR99_h0ECs8Y",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: text
      })
    });
    const data = await res.json();
    console.log('Nebius response:', data);
    aiContent = data.choices?.[0]?.message?.content || "[No response]";
    aiReasoning = data.choices?.[0]?.message?.reasoning || "[No reasoning provided by Nebius]";
  } catch (e) {
    aiContent = "[Error contacting AI service]";
    aiReasoning = e.message || "[Unknown error]";
    console.error(e);
  }
  return { aiContent, aiReasoning };
}

export async function fetchAIResponse(model, text, messages) {
  if (model === "deepseek-chat") {
    return fetchDeepseekResponse(text, messages);
  } else if (model === "nebius-studio") {
    return fetchNebiusResponse(text);
  } else {
    return { aiContent: "[Unknown model]", aiReasoning: "[No reasoning]" };
  }
} 