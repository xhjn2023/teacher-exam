import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authRequired } from '../middleware/auth.js';
import { db, isDbAvailable, COLLECTIONS, NOT_CONFIGURED_MSG } from '../cloudbase.js';
import { logOperation } from '../utils/logger.js';

const router = Router();

// 所有路由需要 JWT 认证
router.use(authRequired);

// GET /api/config - 获取系统配置
router.get('/config', async (_req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      // 降级返回默认配置
      res.json({
        code: 0,
        msg: 'ok',
        data: {
          siteName: '教师考试题库管理后台',
          siteDescription: '教师考试题库管理系统',
          contactEmail: '',
          maxQuestionsPerExam: 100,
          defaultExamDuration: 120,
          enableRegistration: true,
          enableNotice: false,
          noticeContent: '',
        },
      });
      return;
    }

    const result = await db.collection(COLLECTIONS.SYSTEM_CONFIG).limit(1).get();
    const config = result.data && result.data[0];

    if (!config) {
      // 返回默认配置
      res.json({
        code: 0,
        msg: 'ok',
        data: {
          siteName: '教师考试题库管理后台',
          siteDescription: '教师考试题库管理系统',
          contactEmail: '',
          maxQuestionsPerExam: 100,
          defaultExamDuration: 120,
          enableRegistration: true,
          enableNotice: false,
          noticeContent: '',
        },
      });
      return;
    }

    // 移除 _id 字段
    const { _id, ...configData } = config as any;
    res.json({ code: 0, msg: 'ok', data: configData });
  } catch (e: any) {
    console.error('[获取系统配置错误]', e);
    res.json({ code: 500, msg: e.message || '获取系统配置失败', data: null });
  }
});

// PUT /api/config - 更新系统配置
router.put('/config', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const updateData = { ...req.body };

    // 查询是否已有配置记录
    const result = await db.collection(COLLECTIONS.SYSTEM_CONFIG).limit(1).get();
    const existing = result.data && result.data[0];

    if (existing) {
      await db.collection(COLLECTIONS.SYSTEM_CONFIG).doc(existing._id).update({ data: updateData });
    } else {
      await db.collection(COLLECTIONS.SYSTEM_CONFIG).add({ data: updateData });
    }

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '系统配置',
      action: '更新系统配置',
      target: 'system_config',
      detail: JSON.stringify(updateData),
      ip: req.ip,
    });

    res.json({ code: 0, msg: '更新成功', data: null });
  } catch (e: any) {
    console.error('[更新系统配置错误]', e);
    res.json({ code: 500, msg: e.message || '更新系统配置失败', data: null });
  }
});

// GET /api/logs - 获取操作日志
router.get('/logs', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const module = (req.query.module as string) || '';

    const where: any = {};
    if (module) where.module = module;

    const countResult = await db.collection(COLLECTIONS.OPERATION_LOGS).where(where).count();
    const total = countResult.total;

    const listResult = await db.collection(COLLECTIONS.OPERATION_LOGS)
      .where(where)
      .orderBy('createTime', 'desc')
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
    console.error('[获取操作日志错误]', e);
    res.json({ code: 500, msg: e.message || '获取操作日志失败', data: null });
  }
});

// GET /api/admins - 获取管理员列表
router.get('/admins', async (_req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const result = await db.collection(COLLECTIONS.ADMINS)
      .field({ password: false })
      .get();

    res.json({ code: 0, msg: 'ok', data: result.data });
  } catch (e: any) {
    console.error('[获取管理员列表错误]', e);
    res.json({ code: 500, msg: e.message || '获取管理员列表失败', data: null });
  }
});

// POST /api/admins - 新增管理员
router.post('/admins', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const { username, password, name, role, email, phone, avatar } = req.body;
    if (!username || !password || !name) {
      res.json({ code: 400, msg: '用户名、密码和姓名不能为空', data: null });
      return;
    }

    // 检查用户名是否已存在
    const existResult = await db.collection(COLLECTIONS.ADMINS).where({ username }).count();
    if (existResult.total > 0) {
      res.json({ code: 400, msg: '用户名已存在', data: null });
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      username,
      password: hashedPassword,
      name,
      role: role || 'content',
      email: email || '',
      phone: phone || '',
      avatar: avatar || '',
      lastLoginTime: '',
      status: 'active',
      createTime: new Date().toISOString(),
    };

    const result = await db.collection(COLLECTIONS.ADMINS).add({ data });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '管理员管理',
      action: '新增管理员',
      target: result.id || '',
      detail: `用户名: ${username}`,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '新增成功', data: { _id: result.id } });
  } catch (e: any) {
    console.error('[新增管理员错误]', e);
    res.json({ code: 500, msg: e.message || '新增管理员失败', data: null });
  }
});

// PUT /api/admins/:id - 更新管理员
router.put('/admins/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    const { password, ...rest } = req.body;
    const updateData: any = { ...rest };
    delete updateData._id;
    delete updateData.username;
    delete updateData.createTime;

    // 如果提供了新密码则加密
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await db.collection(COLLECTIONS.ADMINS).doc(req.params.id).update({ data: updateData });

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '管理员管理',
      action: '更新管理员',
      target: req.params.id,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '更新成功', data: null });
  } catch (e: any) {
    console.error('[更新管理员错误]', e);
    res.json({ code: 500, msg: e.message || '更新管理员失败', data: null });
  }
});

// DELETE /api/admins/:id - 删除管理员
router.delete('/admins/:id', async (req, res) => {
  try {
    if (!isDbAvailable() || !db) {
      res.json({ code: 503, msg: NOT_CONFIGURED_MSG, data: null });
      return;
    }

    // 不允许删除自己
    if (req.params.id === req.admin!.id) {
      res.json({ code: 400, msg: '不能删除当前登录的管理员', data: null });
      return;
    }

    await db.collection(COLLECTIONS.ADMINS).doc(req.params.id).remove();

    await logOperation({
      adminId: req.admin!.id,
      adminName: req.admin!.name,
      module: '管理员管理',
      action: '删除管理员',
      target: req.params.id,
      ip: req.ip,
    });

    res.json({ code: 0, msg: '删除成功', data: null });
  } catch (e: any) {
    console.error('[删除管理员错误]', e);
    res.json({ code: 500, msg: e.message || '删除管理员失败', data: null });
  }
});

export default router;
