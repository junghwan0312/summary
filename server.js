const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST_ADDRESS = process.env.HOST_ADDRESS;
const LOCAL_ADDRESS  = process.env.LOCAL_ADDRESS;

app.use(cors());
app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", `http://${HOST_ADDRESS}:${PORT}`], // 클라이언트에서 API 호출 허용
        },
    },
}));

const API_KEY = process.env.OPENAI_API_KEY; // 서버에서만 사용

app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body; // 클라이언트에서 전달된 프롬프트

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini', // 사용할 모델
            messages: [{ role: 'user', content: prompt }], // 사용자 메시지 배열
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data); // OpenAI API의 응답을 클라이언트에 전달
    } catch (error) {
        console.error('OpenAI API 호출 실패:', error);
        res.status(500).json({ error: 'API 호출 실패' });
    }
});

// 기본 경로
app.get('/', (req, res) => {
    res.send('API 서버에 접속했습니다.');
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}에서 실행 중입니다.`);
});