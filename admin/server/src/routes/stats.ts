import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { db, isDbAvailable, COLLECTIONS, NOT_CONFIGURED_MSG } from '../cloudbase.js';

const router = Router();

// 所有路由需要 JWT 认证
router.use(authRequired);

// GET /api/stats/dashboard - 仪表盘统计数据
router.get('/dashboard', async (_req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    // 并行查询各集合总数
    const [userRes, questionRes, paperRes, subjectRes] = await Promise.all([
      db.collection(COLLECTIONS.USER_PROGRESS).count(),
      db.collection(COLLECTIONS.QUESTIONS).count(),
      db.collection(COLLECTIONS.REAL_PAPERS).count(),
      db.collection(COLLECTIONS.SUBJECTS).count(),
    ]);

    // 查询已发布题目数
    const publishedRes = await db.collection(COLLECTIONS.QUESTIONS)
      .where({ status: 'published' })
      .count();

    // 查询今日新增用户数
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayNewRes = await db.collection(COLLECTIONS.USER_PROGRESS)
      .where({ createTime: db.command.gte(todayStart.toISOString()) })
      .count();

    res.json({
      code: 0,
      msg: 'ok',
      data: {
        kpi: [
          { label: '总用户数', value: userRes.total, unit: '人', change: 0, icon: 'users', color: '#409eff' },
          { label: '题目总数', value: questionRes.total, unit: '题', change: 0, icon: 'question', color: '#67c23a' },
          { label: '已发布题目', value: publishedRes.total, unit: '题', change: 0, icon: 'check', color: '#e6a23c' },
          { label: '套卷总数', value: paperRes.total, unit: '份', change: 0, icon: 'paper', color: '#f56c6c' },
        ],
        todayNewUsers: todayNewRes.total,
        totalSubjects: subjectRes.total,
      },
    });
  } catch (e: any) {
    console.error('[获取仪表盘统计错误]', e);
    res.json({ code: 500, msg: e.message || '获取仪表盘统计失败', data: null });
  }
});

// GET /api/stats/users - 用户分析数据
router.get('/users', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const days = parseInt(req.query.days as string) || 30;

    // 查询所有用户的每日统计
    const userResult = await db.collection(COLLECTIONS.USER_PROGRESS)
      .field({ dailyStats: true })
      .get();

    // 按日期聚合答题量
    const dateMap = new Map<string, { count: number; correctCount: number }>();
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dateMap.set(key, { count: 0, correctCount: 0 });
    }

    for (const user of userResult.data) {
      const stats = (user as any).dailyStats || [];
      for (const stat of stats) {
        if (dateMap.has(stat.date)) {
          const item = dateMap.get(stat.date)!;
          item.count += stat.count || 0;
          item.correctCount += stat.correctCount || 0;
        }
      }
    }

    const trend = Array.from(dateMap.entries()).map(([date, v]) => ({
      date,
      count: v.count,
      correctCount: v.correctCount,
      correctRate: v.count > 0 ? Math.round((v.correctCount / v.count) * 1000) / 10 : 0,
    }));

    // 用户状态分布
    const [activeRes, disabledRes, bannedRes] = await Promise.all([
      db.collection(COLLECTIONS.USER_PROGRESS).where({ status: 'active' }).count(),
      db.collection(COLLECTIONS.USER_PROGRESS).where({ status: 'disabled' }).count(),
      db.collection(COLLECTIONS.USER_PROGRESS).where({ status: 'banned' }).count(),
    ]);

    res.json({
      code: 0,
      msg: 'ok',
      data: {
        trend,
        statusDistribution: [
          { name: '正常', value: activeRes.total },
          { name: '禁用', value: disabledRes.total },
          { name: '封禁', value: bannedRes.total },
        ],
      },
    });
  } catch (e: any) {
    console.error('[获取用户分析错误]', e);
    res.json({ code: 500, msg: e.message || '获取用户分析失败', data: null });
  }
});

// GET /api/stats/questions - 答题分析数据
router.get('/questions', async (_req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    // 题目状态分布
    const [draftRes, pendingRes, publishedRes, offlineRes] = await Promise.all([
      db.collection(COLLECTIONS.QUESTIONS).where({ status: 'draft' }).count(),
      db.collection(COLLECTIONS.QUESTIONS).where({ status: 'pending' }).count(),
      db.collection(COLLECTIONS.QUESTIONS).where({ status: 'published' }).count(),
      db.collection(COLLECTIONS.QUESTIONS).where({ status: 'offline' }).count(),
    ]);

    // 题型分布
    const [singleRes, multiRes, judgeRes, essayRes] = await Promise.all([
      db.collection(COLLECTIONS.QUESTIONS).where({ type: 'single' }).count(),
      db.collection(COLLECTIONS.QUESTIONS).where({ type: 'multi' }).count(),
      db.collection(COLLECTIONS.QUESTIONS).where({ type: 'judge' }).count(),
      db.collection(COLLECTIONS.QUESTIONS).where({ type: 'essay' }).count(),
    ]);

    res.json({
      code: 0,
      msg: 'ok',
      data: {
        statusDistribution: [
          { name: '草稿', value: draftRes.total },
          { name: '待审核', value: pendingRes.total },
          { name: '已发布', value: publishedRes.total },
          { name: '已下架', value: offlineRes.total },
        ],
        typeDistribution: [
          { name: '单选题', value: singleRes.total },
          { name: '多选题', value: multiRes.total },
          { name: '判断题', value: judgeRes.total },
          { name: '简答题', value: essayRes.total },
        ],
      },
    });
  } catch (e: any) {
    console.error('[获取答题分析错误]', e);
    res.json({ code: 500, msg: e.message || '获取答题分析失败', data: null });
  }
});

// GET /api/stats/content - 内容热度数据
router.get('/content', async (_req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const database = db;

    // 各科目题目数
    const subjectsResult = await database.collection(COLLECTIONS.SUBJECTS).get();
    const subjects = subjectsResult.data;

    const subjectQuestionCounts = await Promise.all(
      subjects.map(async (subject: any) => {
        const countRes = await database.collection(COLLECTIONS.QUESTIONS)
          .where({ subjectId: subject._id })
          .count();
        return { name: subject.name, value: countRes.total };
      })
    );

    // 套卷状态分布
    const [draftPaperRes, publishedPaperRes] = await Promise.all([
      database.collection(COLLECTIONS.REAL_PAPERS).where({ status: 'draft' }).count(),
      database.collection(COLLECTIONS.REAL_PAPERS).where({ status: 'published' }).count(),
    ]);

    res.json({
      code: 0,
      msg: 'ok',
      data: {
        subjectQuestionCounts,
        paperStatusDistribution: [
          { name: '草稿', value: draftPaperRes.total },
          { name: '已发布', value: publishedPaperRes.total },
        ],
      },
    });
  } catch (e: any) {
    console.error('[获取内容热度错误]', e);
    res.json({ code: 500, msg: e.message || '获取内容热度失败', data: null });
  }
});

export default router;
