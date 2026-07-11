import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { db, isDbAvailable, COLLECTIONS, NOT_CONFIGURED_MSG } from '../cloudbase.js';
import { logOperation } from '../utils/logger.js';

const router = Router();

// 所有路由需要 JWT 认证
router.use(authRequired);

// GET /api/users - 获取用户列表（支持分页、搜索、状态筛选）
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

    // 构建查询条件
    const where: any = {};
    if (keyword) {
      where.nickName = db.RegExp({ regexp: keyword, options: 'i' });
    }
    if (status) {
      where.status = status;
    }

    // 查询总数
    const countResult = await db.collection(COLLECTIONS.USER_PROGRESS).where(where).count();
    const total = countResult.total;

    // 查询列表
    const listResult = await db.collection(COLLECTIONS.USER_PROGRESS)
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
    console.error('[获取用户列表错误]', e);
    res.json({ code: 500, msg: e.message || '获取用户列表失败', data: null });
  }
});

// GET /api/users/:id - 获取用户详情
router.get('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const result = await db.collection(COLLECTIONS.USER_PROGRESS).doc(req.params.id).get();
    if (!result.data) {
      res.json({ code: 404, msg: '用户不存在', data: null });
      return;
    }

    res.json({ code: 0, msg: 'ok', data: result.data });
  } catch (e: any) {
    console.error('[获取用户详情错误]', e);
    res.json({ code: 500, msg: e.message || '获取用户详情失败', data: null });
  }
});

// PUT /api/users/:id - 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const { nickName, avatarUrl, status, ...rest } = req.body;
    const updateData: any = { updateTime: new Date().toISOString() };
    if (nickName !== undefined) updateData.nickName = nickName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (status !== undefined) updateData.status = status;
    Object.assign(updateData, rest);

    await db.collection(COLLECTIONS.USER_PROGRESS).doc(req.params.id).update({ data: updateData });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '用户管理',
      action: '更新用户',
      target: req.params.id,
      detail: JSON.stringify(updateData),
      ip: req.ip,
    });

    res.json({ code: 0, msg: '更新成功', data: null });
  } catch (e: any) {
    console.error('[更新用户错误]', e);
    res.json({ code: 500, msg: e.message || '更新用户失败', data: null });
  }
});

// PATCH /api/users/:id/status - 更新用户状态
router.patch('/:id/status', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const { status } = req.body;
    if (!['active', 'disabled', 'banned'].includes(status)) {
      res.json({ code: 400, msg: '无效的状态值', data: null });
      return;
    }

    await db.collection(COLLECTIONS.USER_PROGRESS).doc(req.params.id).update({
      data: { status, updateTime: new Date().toISOString() },
    });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '用户管理',
      action: '更新用户状态',
      target: req.params.id,
      detail: `状态变更为 ${status}`,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '状态更新成功', data: null });
  } catch (e: any) {
    console.error('[更新用户状态错误]', e);
    res.json({ code: 500, msg: e.message || '更新用户状态失败', data: null });
  }
});

// DELETE /api/users/:id - 删除用户
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    await db.collection(COLLECTIONS.USER_PROGRESS).doc(req.params.id).remove();

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '用户管理',
      action: '删除用户',
      target: req.params.id,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '删除成功', data: null });
  } catch (e: any) {
    console.error('[删除用户错误]', e);
    res.json({ code: 500, msg: e.message || '删除用户失败', data: null });
  }
});

export default router;
