import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// 导入路由
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import questionsRouter from './routes/questions.js';
import subjectsRouter from './routes/subjects.js';
import chaptersRouter from './routes/chapters.js';
import papersRouter from './routes/papers.js';
import statsRouter from './routes/stats.js';
import configRouter from './routes/config.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 配置 CORS
app.use(cors());

// 解析 JSON 请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, msg: 'ok', data: { status: 'running', time: new Date().toISOString() } });
});

// 注册路由
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/chapters', chaptersRouter);
app.use('/api/papers', papersRouter);
app.use('/api/stats', statsRouter);
app.use('/api', configRouter);

// 全局错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[服务器错误]', err);
  res.status(500).json({ code: 500, msg: err.message || '服务器内部错误', data: null });
});

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在', data: null });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`[服务器] 已启动，监听端口 ${PORT}`);
  console.log(`[服务器] 健康检查: http://localhost:${PORT}/api/health`);
});

export default app;
