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
    const fullContent = data.choices?.[0]?.message?.content || "[No response]";
    
    // 解析分析过程和回答
    const { reasoning, content } = parseReasoningAndContent(fullContent);
    aiContent = content;
    aiReasoning = reasoning;
  } catch (e) {
    aiContent = "[Error contacting AI service]";
    aiReasoning = e.message || "[Unknown error]";
    console.error(e);
  }
  return { aiContent, aiReasoning };
}

async function fetchDeepseekStreamResponse(text, messages, onChunk) {
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
        temperature: 0.7,
        stream: true
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
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

export async function fetchAIStreamResponse(model, text, messages, onChunk) {
  if (model === "deepseek-chat") {
    return fetchDeepseekStreamResponse(text, messages, onChunk);
  } else if (model === "nebius-studio") {
    // Nebius 暂不支持流式，回退到普通请求
    const result = await fetchNebiusResponse(text);
    onChunk(result.aiContent, true);
    return result;
  } else {
    const result = { aiContent: "[Unknown model]", aiReasoning: "[No reasoning]" };
    onChunk(result.aiContent, true);
    return result;
  }
} 