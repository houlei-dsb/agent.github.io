const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = 3000;

// 配置
const API_MODE = process.env.API_MODE || 'local';
const REMOTE_API_URL = process.env.REMOTE_API_URL || 'https://8.209.232.25';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 获取配置接口
app.get('/api/config', (req, res) => {
  res.json({
    apiMode: API_MODE,
    remoteUrl: REMOTE_API_URL,
    localUrl: `http://localhost:${PORT}`
  });
});

// 封装fetch调用
async function makeApiCall(url, options) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const https = require('https');
    
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(url);
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 60000
    };
    
    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// AI调用函数
async function callAI(prompt) {
  const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  
  const data = JSON.stringify({
    model: process.env.MODEL_NAME || 'qwen3.6-plus',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });
  
  console.log('AI请求模型:', process.env.MODEL_NAME);
  console.log('AI请求长度:', data.length);
  
  const response = await makeApiCall(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Length': Buffer.byteLength(data)
    },
    body: data,
    timeout: 60000
  });
  
  console.log('AI响应状态:', response.status);
  
  if (!response.body) {
    throw new Error('AI API返回空响应');
  }
  
  try {
    const result = JSON.parse(response.body);
    if (result.choices && result.choices[0] && result.choices[0].message) {
      return result.choices[0].message.content;
    } else {
      throw new Error('AI API返回格式错误: ' + JSON.stringify(result).substring(0, 200));
    }
  } catch (error) {
    console.error('解析响应失败:', error.message);
    console.error('原始响应:', response.body.substring(0, 500));
    throw new Error('解析AI API响应失败: ' + error.message);
  }
}

// 检查用户是否说出结束词语
function isFinishWord(query) {
  const finishWords = [
    '可以了', '够了', '好了', '就这样', '就这些', '结束', '提交',
    '开始搜索', '搜索', '查找', '查询', '推荐', '帮我找'
  ];
  
  const cleanQuery = query.trim();
  return finishWords.some(word => cleanQuery.includes(word));
}

// 驾校选择 API
app.post('/api/math', async (req, res) => {
  console.log('驾校选择 API 调用:', req.body);
  
  const query = req.body.query || '';
  const history = req.body.history || '';
  
  if (!query || query.trim() === '') {
    res.json({ result: '请输入有效的查询内容' });
    return;
  }
  
  try {
    // 构建完整的用户需求（结合历史对话）
    const fullQuery = history ? `${history}\n${query}` : query;
    
    // 检查是否说出结束词语
    if (isFinishWord(query)) {
      // 用户说"可以了"等，开始搜索推荐
      const prompt = `你是一个专业的驾校推荐顾问"小侯驾校助手"。请根据用户的需求推荐合适的驾校。

用户需求：${fullQuery}

请推荐2-3家合适的驾校，包括：
- 驾校名称
- 价格范围
- 口碑评价
- 特点和优势

回复语言：中文，回复要简洁友好。`;
      
      const result = await callAI(prompt);
      console.log('驾校推荐结果获取成功');
      res.json({ result });
    } else {
      // 用户还在补充需求，继续询问
      const askMessage = `好的，已记录您的需求：${query}。

请问您还有其他要求吗？比如：
- 价格预算（如：5000元以内）
- 驾校口碑/评价
- 通过率要求
- 上课时间（周末班/晚间班）
- 距离要求

如果没有其他要求，请说"可以了"或"够了"，我会为您推荐最合适的驾校。`;
      res.json({ result: askMessage });
    }
    
  } catch (error) {
    console.error('AI调用失败:', error.message);
    res.json({ result: `抱歉，AI服务调用失败：${error.message}` });
  }
});

// 教练选择 API
app.post('/api/research', async (req, res) => {
  console.log('教练匹配 API 调用:', req.body);
  
  const query = req.body.query || '';
  const history = req.body.history || '';
  
  if (!query || query.trim() === '') {
    res.json({ result: '请输入有效的查询内容' });
    return;
  }
  
  try {
    // 构建完整的用户需求（结合历史对话）
    const fullQuery = history ? `${history}\n${query}` : query;
    
    // 检查是否说出结束词语
    if (isFinishWord(query)) {
      // 用户说"可以了"等，开始搜索推荐
      const prompt = `你是一个专业的驾考教练匹配顾问"小侯驾校助手"。请根据用户的偏好推荐合适的教练。

用户偏好：${fullQuery}

请推荐2-3位合适的教练，包括：
- 教练姓名
- 教学风格
- 专长科目
- 学员评价

回复语言：中文，回复要简洁友好。`;
      
      const result = await callAI(prompt);
      console.log('教练匹配结果获取成功');
      res.json({ result });
    } else {
      // 用户还在补充需求，继续询问
      const askMessage = `好的，已记录您的偏好：${query}。

请问您还有其他要求吗？比如：
- 教学风格（耐心细致/严格认真/幽默风趣）
- 专长科目（科目二/科目三）
- 上课时间（周末/晚间）
- 性别偏好

如果没有其他要求，请说"可以了"或"够了"，我会为您匹配最合适的教练。`;
      res.json({ result: askMessage });
    }
    
  } catch (error) {
    console.error('AI调用失败:', error.message);
    res.json({ result: `抱歉，AI服务调用失败：${error.message}` });
  }
});

// 考试答疑 API
app.post('/api/code', async (req, res) => {
  console.log('考试答疑 API 调用:', req.body);
  
  const query = req.body.query || '';
  const history = req.body.history || '';
  
  if (!query || query.trim() === '') {
    res.json({ result: '请输入有效的查询内容' });
    return;
  }
  
  try {
    // 构建完整的用户需求（结合历史对话）
    const fullQuery = history ? `${history}\n${query}` : query;
    
    // 检查是否说出结束词语
    if (isFinishWord(query)) {
      // 用户说"可以了"等，开始搜索推荐
      const prompt = `你是一个专业的驾考辅导老师"小侯驾校助手"。请根据之前的对话为用户提供驾考相关的建议。

用户对话历史：${fullQuery}

请根据用户提到的城市和需求，提供驾考相关的建议和注意事项。

回复语言：中文，回复要简洁友好。`;
      
      const result = await callAI(prompt);
      console.log('考试答疑结果获取成功');
      res.json({ result });
    } else {
      // 考试答疑直接回答问题
      const prompt = `你是一个专业的驾考辅导老师"小侯驾校助手"。请详细解答用户关于驾考的问题。

用户问题：${fullQuery}

请提供详细、清晰的解答，包括：
- 操作步骤
- 关键技巧
- 常见错误和注意事项

回复语言：中文，回复要简洁友好。`;
      
      const result = await callAI(prompt);
      console.log('考试答疑结果获取成功');
      res.json({ result });
    }
    
  } catch (error) {
    console.error('AI调用失败:', error.message);
    res.json({ result: `抱歉，AI服务调用失败：${error.message}` });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('🚀 驾校助手服务运行在 http://localhost:' + PORT);
  console.log('📦 使用模型:', process.env.MODEL_NAME || 'qwen3.6-plus');
  console.log('✅ 已启用AI模式，完全使用.env配置的模型回答');
});