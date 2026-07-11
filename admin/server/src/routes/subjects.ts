import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { db, isDbAvailable, COLLECTIONS, NOT_CONFIGURED_MSG } from '../cloudbase.js';
import { logOperation } from '../utils/logger.js';

const router = Router();

// 所有路由需要 JWT 认证
router.use(authRequired);

// GET /api/subjects - 获取科目列表
router.get('/', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const examTypeId = (req.query.examTypeId as string) || '';
    const where: any = {};
    if (examTypeId) where.examTypeId = examTypeId;

    const result = await db.collection(COLLECTIONS.SUBJECTS)
      .where(where)
      .orderBy('sort', 'asc')
      .get();

    res.json({ code: 0, msg: 'ok', data: result.data });
  } catch (e: any) {
    console.error('[获取科目列表错误]', e);
    res.json({ code: 500, msg: e.message || '获取科目列表失败', data: null });
  }
});

// POST /api/subjects - 新增科目
router.post('/', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const data = {
      ...req.body,
      questionCount: 0,
      createTime: new Date().toISOString(),
    };

    const result = await db.collection(COLLECTIONS.SUBJECTS).add({ data });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '科目管理',
      action: '新增科目',
      target: result.id || '',
      ip: req.ip,
    });

    res.json({ code: 0, msg: '新增成功', data: { _id: result.id } });
  } catch (e: any) {
    console.error('[新增科目错误]', e);
    res.json({ code: 500, msg: e.message || '新增科目失败', data: null });
  }
});

// PUT /api/subjects/:id - 更新科目
router.put('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.createTime;

    await db.collection(COLLECTIONS.SUBJECTS).doc(req.params.id).update({ data: updateData });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '科目管理',
      action: '更新科目',
      target: req.params.id,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '更新成功', data: null });
  } catch (e: any) {
    console.error('[更新科目错误]', e);
    res.json({ code: 500, msg: e.message || '更新科目失败', data: null });
  }
});

// DELETE /api/subjects/:id - 删除科目
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    await db.collection(COLLECTIONS.SUBJECTS).doc(req.params.id).remove();

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '科目管理',
      action: '删除科目',
      target: req.params.id,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '删除成功', data: null });
  } catch (e: any) {
    console.error('[删除科目错误]', e);
    res.json({ code: 500, msg: e.message || '删除科目失败', data: null });
  }
});

export default router;
