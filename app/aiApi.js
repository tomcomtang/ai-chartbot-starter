// AI API 请求模块

async function fetchDeepseekStreamResponse(text, messages, onChunk) {
  let aiContent = "";
  
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
        temperature: 0.7,
        stream: true
      })
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            // 流式输出结束，解析分析过程和回答
            const { reasoning, content } = parseReasoningAndContent(aiContent);
            onChunk(content, reasoning, true);
            return { aiContent: content, aiReasoning: reasoning };
          }

          try {
            const json = JSON.parse(data);
            console.log('DeepSeek stream data:', json);
            
            const chunk = json.choices?.[0]?.delta?.content || "";
            if (chunk) {
              aiContent += chunk;
              console.log('DeepSeek stream chunk:', chunk);
              console.log('DeepSeek accumulated content:', aiContent);
              
              // 解析当前的分析过程和回答
              const { reasoning, content } = parseReasoningAndContent(aiContent);
              onChunk(content, reasoning, false);
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', data, e);
          }
        }
      }
    }
  } catch (e) {
    aiContent = "[Error contacting AI service]";
    console.error(e);
    onChunk(aiContent, "", true);
  }
  return { aiContent, aiReasoning: "" };
}

// 解析分析过程和回答的函数
function parseReasoningAndContent(fullContent) {
  // 尝试匹配中文格式
  let reasoningMatch = fullContent.match(/\*\*分析过程：\*\*\s*\n([\s\S]*?)(?=\n\*\*回答：\*\*)/);
  let contentMatch = fullContent.match(/\*\*回答：\*\*\s*\n([\s\S]*)/);
  
  // 如果没有找到中文格式，尝试匹配英文格式
  if (!reasoningMatch) {
    reasoningMatch = fullContent.match(/\*\*Analysis Process:\*\*\s*\n([\s\S]*?)(?=\n\*\*Answer:\*\*)/);
    contentMatch = fullContent.match(/\*\*Answer:\*\*\s*\n([\s\S]*)/);
  }
  
  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : "";
  const content = contentMatch ? contentMatch[1].trim() : fullContent;
  
  return { reasoning, content };
}

async function fetchNebiusStreamResponse(text, messages, onChunk) {
  let aiContent = "";

  try {
    const res = await fetch("https://api.studio.nebius.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ***REMOVED***OiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnaXRodWJ8MjI3ODM5MTIiLCJzY29wZSI6Im9wZW5pZCBvZmZsaW5lX2FjY2VzcyIsImlzcyI6ImFwaV9rZXlfaXNzdWVyIiwiYXVkIjpbImh0dHBzOi8vbmViaXVzLWluZmVyZW5jZS5ldS5hdXRoMC5jb20vYXBpL3YyLyJdLCJleHAiOjE5MDkyMTQwNzUsInV1aWQiOiJlNzM1MzM1YS0zZWI3LTRlMzMtYWJkMi0zYzM4ZWYyZjY2ZjgiLCJuYW1lIjoiY2hhc2V0b255IiwiZXhwaXJlc19hdCI6IjIwMzAtMDctMDJUMDk6MTQ6MzUrMDAwMCJ9.JojSM4YOYO40aCfP9JAR4c9CZSotsoaZR99_h0ECs8Y"
      },
      body: JSON.stringify({
        // model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
        model: "deepseek-ai/DeepSeek-V3-0324",
        store: false,
        messages,
        max_tokens: 1024,
        temperature: 1,
        top_p: 1,
        n: 1,
        stream: true,
        presence_penalty: 0,
        frequency_penalty: 0,
      })
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            const { reasoning, content } = parseReasoningAndContent(aiContent);
            onChunk(content, reasoning, true);
            return { aiContent: content, aiReasoning: reasoning };
          }
          try {
            const json = JSON.parse(data);
            const chunk = json.choices?.[0]?.delta?.content || "";
            if (chunk) {
              aiContent += chunk;
              const { reasoning, content } = parseReasoningAndContent(aiContent);
              onChunk(content, reasoning, false);
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', data, e);
          }
        }
      }
    }
  } catch (e) {
    aiContent = "[Error contacting Nebius service]";
    console.error(e);
    onChunk(aiContent, "", true);
  }
  return { aiContent, aiReasoning: "" };
}

async function fetchGpt4oMiniStreamResponse(text, messages, onChunk) {
  let aiContent = "";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ***REMOVED***proj-JW6RrzrHBB3A5tZNbdRPFrQ-NoGceY_QcgGkxmWmi0kR232hMmwKq9noIq003qzh6Eg76TXcNwT3BlbkFJ5rBmXcGbxy3C34UGaJECSCa5mIrJrjvzGylfghiZvwqEWjEV6IThj2a6s95QSecoF1kukYhLMA"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        store: true,
        messages,
        stream: true
      })
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            const { reasoning, content } = parseReasoningAndContent(aiContent);
            onChunk(content, reasoning, true);
            return { aiContent: content, aiReasoning: reasoning };
          }
          try {
            const json = JSON.parse(data);
            const chunk = json.choices?.[0]?.delta?.content || "";
            if (chunk) {
              aiContent += chunk;
              const { reasoning, content } = parseReasoningAndContent(aiContent);
              onChunk(content, reasoning, false);
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', data, e);
          }
        }
      }
    }
  } catch (e) {
    aiContent = "[Error contacting OpenAI service]";
    console.error(e);
    onChunk(aiContent, "", true);
  }
  return { aiContent, aiReasoning: "" };
}

async function fetchGeminiStreamResponse(text, messages, onChunk) {
  let aiContent = "";

  // 拼接 prompt，包含 system prompt 和最后一条 user 消息
  const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content || text;
  const systemPrompt = messages.find(m => m.role === "system")?.content || "";
  const prompt = `${systemPrompt}\n\nUser: ${lastUserMsg}`;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?alt=sse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": "***REMOVED***SyBhoasPY6XwLY09LtvbMrEC1KzuIosRdiI"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 1,
            topP: 1,
            maxOutputTokens: 1024
          },
          safetySettings: []
        })
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let isComplete = false;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            const { reasoning, content } = parseReasoningAndContent(aiContent);
            onChunk(content, reasoning, true);
            isComplete = true;
            return { aiContent: content, aiReasoning: reasoning };
          }
          try {
            const json = JSON.parse(data);
            const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (chunk) {
              aiContent += chunk;
              const { reasoning, content } = parseReasoningAndContent(aiContent);
              onChunk(content, reasoning, false);
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', data, e);
          }
        }
      }
    }
    // 关键补充：流关闭但没收到 [DONE]，这里补一次结束
    if (!isComplete && aiContent) {
      const { reasoning, content } = parseReasoningAndContent(aiContent);
      onChunk(content, reasoning, true);
      console.log('[Gemini] 流关闭但没收到 [DONE]，这里补一次结束');
      return { aiContent: content, aiReasoning: reasoning };
    }
  } catch (e) {
    aiContent = "[Error contacting Gemini service]";
    console.error(e);
    onChunk(aiContent, "", true);
  }
  return { aiContent, aiReasoning: "" };
}

export async function fetchAIStreamResponse(model, text, messages, onChunk) {
  if (model === "deepseek-chat") {
    return fetchDeepseekStreamResponse(text, messages, onChunk);
  } else if (model === "nebius-studio") {
    return fetchNebiusStreamResponse(text, messages, onChunk);
  } else if (model === "gpt-4o-mini") {
    return fetchGpt4oMiniStreamResponse(text, messages, onChunk);
  } else if (model === "gemini-flash") {
    return fetchGeminiStreamResponse(text, messages, onChunk);
  } else {
    const result = { aiContent: "[Unknown model]", aiReasoning: "[No reasoning]" };
    onChunk(result.aiContent, result.aiReasoning, true);
    return result;
  }
} 