import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { db, isDbAvailable, COLLECTIONS, NOT_CONFIGURED_MSG } from '../cloudbase.js';
import { logOperation } from '../utils/logger.js';

const router = Router();

// 所有路由需要 JWT 认证
router.use(authRequired);

// GET /api/questions - 获取题目列表（支持分页、搜索、筛选）
router.get('/', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const keyword = (req.query.keyword as string) || '';
    const status = (req.query.status as string) || '';
    const type = (req.query.type as string) || '';
    const subjectId = (req.query.subjectId as string) || '';
    const chapterId = (req.query.chapterId as string) || '';
    const examTypeId = (req.query.examTypeId as string) || '';

    // 构建查询条件
    const where: any = {};
    if (keyword) {
      where.question = db.RegExp({ regexp: keyword, options: 'i' });
    }
    if (status) where.status = status;
    if (type) where.type = type;
    if (subjectId) where.subjectId = subjectId;
    if (chapterId) where.chapterId = chapterId;
    if (examTypeId) where.examTypeId = examTypeId;

    const countResult = await db.collection(COLLECTIONS.QUESTIONS).where(where).count();
    const total = countResult.total;

    const listResult = await db.collection(COLLECTIONS.QUESTIONS)
      .where(where)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    res.json({
      code: 0,
      msg: 'ok',
      data: {
        list: listResult.data,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      },
    });
  } catch (e: any) {
    console.error('[获取题目列表错误]', e);
    res.json({ code: 500, msg: e.message || '获取题目列表失败', data: null });
  }
});

// GET /api/questions/:id - 获取题目详情
router.get('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const result = await db.collection(COLLECTIONS.QUESTIONS).doc(req.params.id).get();
    if (!result.data) {
      res.json({ code: 404, msg: '题目不存在', data: null });
      return;
    }

    res.json({ code: 0, msg: 'ok', data: result.data });
  } catch (e: any) {
    console.error('[获取题目详情错误]', e);
    res.json({ code: 500, msg: e.message || '获取题目详情失败', data: null });
  }
});

// POST /api/questions - 新增题目
router.post('/', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const now = new Date().toISOString();
    const questionData = {
      ...req.body,
      status: req.body.status || 'draft',
      createTime: now,
      updateTime: now,
    };

    const result = await db.collection(COLLECTIONS.QUESTIONS).add({ data: questionData });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '题目管理',
      action: '新增题目',
      target: result.id || '',
      ip: req.ip,
    });

    res.json({ code: 0, msg: '新增成功', data: { _id: result.id } });
  } catch (e: any) {
    console.error('[新增题目错误]', e);
    res.json({ code: 500, msg: e.message || '新增题目失败', data: null });
  }
});

// PUT /api/questions/:id - 更新题目
router.put('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const updateData = {
      ...req.body,
      updateTime: new Date().toISOString(),
    };
    // 不允许直接修改 _id 和 createTime
    delete updateData._id;
    delete updateData.createTime;

    await db.collection(COLLECTIONS.QUESTIONS).doc(req.params.id).update({ data: updateData });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '题目管理',
      action: '更新题目',
      target: req.params.id,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '更新成功', data: null });
  } catch (e: any) {
    console.error('[更新题目错误]', e);
    res.json({ code: 500, msg: e.message || '更新题目失败', data: null });
  }
});

// PATCH /api/questions/:id/status - 更新题目状态（审核流程）
router.patch('/:id/status', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const { status } = req.body;
    if (!['draft', 'pending', 'published', 'offline'].includes(status)) {
      res.json({ code: 400, msg: '无效的状态值', data: null });
      return;
    }

    await db.collection(COLLECTIONS.QUESTIONS).doc(req.params.id).update({
      data: { status, updateTime: new Date().toISOString() },
    });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '题目管理',
      action: '更新题目状态',
      target: req.params.id,
      detail: `状态变更为 ${status}`,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '状态更新成功', data: null });
  } catch (e: any) {
    console.error('[更新题目状态错误]', e);
    res.json({ code: 500, msg: e.message || '更新题目状态失败', data: null });
  }
});

// DELETE /api/questions/:id - 删除题目
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    await db.collection(COLLECTIONS.QUESTIONS).doc(req.params.id).remove();

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '题目管理',
      action: '删除题目',
      target: req.params.id,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '删除成功', data: null });
  } catch (e: any) {
    console.error('[删除题目错误]', e);
    res.json({ code: 500, msg: e.message || '删除题目失败', data: null });
  }
});

export default router;
