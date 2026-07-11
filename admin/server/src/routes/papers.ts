import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { db, isDbAvailable, COLLECTIONS, NOT_CONFIGURED_MSG } from '../cloudbase.js';
import { logOperation } from '../utils/logger.js';

const router = Router();

// 所有路由需要 JWT 认证
router.use(authRequired);

// GET /api/papers - 获取套卷列表
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
    const subjectId = (req.query.subjectId as string) || '';
    const examTypeId = (req.query.examTypeId as string) || '';

    const where: any = {};
    if (keyword) {
      where.name = db.RegExp({ regexp: keyword, options: 'i' });
    }
    if (status) where.status = status;
    if (subjectId) where.subjectId = subjectId;
    if (examTypeId) where.examTypeId = examTypeId;

    const countResult = await db.collection(COLLECTIONS.REAL_PAPERS).where(where).count();
    const total = countResult.total;

    const listResult = await db.collection(COLLECTIONS.REAL_PAPERS)
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
    console.error('[获取套卷列表错误]', e);
    res.json({ code: 500, msg: e.message || '获取套卷列表失败', data: null });
  }
});

// POST /api/papers - 新增套卷
router.post('/', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const data = {
      ...req.body,
      questionIds: req.body.questionIds || [],
      status: req.body.status || 'draft',
      createTime: new Date().toISOString(),
    };

    const result = await db.collection(COLLECTIONS.REAL_PAPERS).add({ data });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '套卷管理',
      action: '新增套卷',
      target: result.id || '',
      ip: req.ip,
    });

    res.json({ code: 0, msg: '新增成功', data: { _id: result.id } });
  } catch (e: any) {
    console.error('[新增套卷错误]', e);
    res.json({ code: 500, msg: e.message || '新增套卷失败', data: null });
  }
});

// PUT /api/papers/:id - 更新套卷
router.put('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.createTime;

    await db.collection(COLLECTIONS.REAL_PAPERS).doc(req.params.id).update({ data: updateData });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '套卷管理',
      action: '更新套卷',
      target: req.params.id,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '更新成功', data: null });
  } catch (e: any) {
    console.error('[更新套卷错误]', e);
    res.json({ code: 500, msg: e.message || '更新套卷失败', data: null });
  }
});

// DELETE /api/papers/:id - 删除套卷
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    await db.collection(COLLECTIONS.REAL_PAPERS).doc(req.params.id).remove();

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '套卷管理',
      action: '删除套卷',
      target: req.params.id,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '删除成功', data: null });
  } catch (e: any) {
    console.error('[删除套卷错误]', e);
    res.json({ code: 500, msg: e.message || '删除套卷失败', data: null });
  }
});

export default router;
