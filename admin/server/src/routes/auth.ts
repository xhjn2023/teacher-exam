import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authRequired, generateToken } from '../middleware/auth.js';
import { db, isDbAvailable, COLLECTIONS, NOT_CONFIGURED_MSG } from '../cloudbase.js';
import { logOperation } from '../utils/logger.js';

const router = Router();

// POST /api/auth/login - 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.json({ code: 400, msg: '用户名和密码不能为空', data: null });
      return;
    }

    // 云数据库可用时，从 admins 集合查询
    if (isDbAvailable() && db) {
      try {
        const result = await db.collection(COLLECTIONS.ADMINS)
          .where({ username })
          .get();

        const admin = result.data && result.data[0];
        if (!admin) {
          // 集合存在但没有该用户，返回错误
          res.json({ code: 401, msg: '用户名或密码错误', data: null });
          return;
        }
        if (admin.status === 'disabled') {
          res.json({ code: 403, msg: '账号已被禁用', data: null });
          return;
        }

        // 校验密码
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          res.json({ code: 401, msg: '用户名或密码错误', data: null });
          return;
        }

        // 更新最后登录时间
        await db.collection(COLLECTIONS.ADMINS).doc(admin._id).update({
          data: { lastLoginTime: new Date().toISOString() },
        });

        const token = generateToken({
          id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
        });

        // 记录操作日志
        await logOperation({
          adminId: admin._id,
          adminName: admin.name,
          module: '认证',
          action: '登录',
          target: admin.username,
          ip: req.ip,
        });

        res.json({
          code: 0,
          msg: '登录成功',
          data: {
            token,
            admin: {
              id: admin._id,
              username: admin.username,
              name: admin.name,
              role: admin.role,
              avatar: admin.avatar,
              email: admin.email,
              phone: admin.phone,
            },
          },
        });
        return;
      } catch (error: any) {
        // 如果集合不存在，降级到本地默认账号
        if (error.code === 'DATABASE_COLLECTION_NOT_EXIST') {
          console.warn('[登录] admins 集合不存在，降级到本地默认账号');
        } else {
          throw error;
        }
      }
    }

    // 云数据库不可用时，使用 .env 中的默认账号降级登录
    const envUsername = process.env.ADMIN_USERNAME || 'admin';
    const envPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (username === envUsername && password === envPassword) {
      const token = generateToken({
        id: 'default-admin',
        username: envUsername,
        name: '超级管理员',
        role: 'super',
      });
      res.json({
        code: 0,
        msg: '登录成功（降级模式，使用默认账号）',
        data: {
          token,
          admin: {
            id: 'default-admin',
            username: envUsername,
            name: '超级管理员',
            role: 'super',
            avatar: '',
            email: '',
            phone: '',
          },
        },
      });
      return;
    }

    res.json({ code: 401, msg: '用户名或密码错误', data: null });
  } catch (e: any) {
    console.error('[登录错误]', e);
    res.json({ code: 500, msg: e.message || '登录失败', data: null });
  }
});

// GET /api/auth/profile - 获取当前管理员信息
router.get('/profile', authRequired, async (req, res) => {
  try {
    if (!req.admin) {
      res.json({ code: 401, msg: '未登录', data: null });
      return;
    }

    // 降级模式
    if (!isDbAvailable() || !db) {
      res.json({
        code: 0,
        msg: 'ok',
        data: {
          id: req.admin.id,
          username: req.admin.username,
          name: req.admin.name,
          role: req.admin.role,
          avatar: '',
          email: '',
          phone: '',
        },
      });
      return;
    }

    const result = await db.collection(COLLECTIONS.ADMINS).doc(req.admin.id).get();
    const admin = result.data;
    if (!admin) {
      res.json({ code: 404, msg: '管理员不存在', data: null });
      return;
    }

    res.json({
      code: 0,
      msg: 'ok',
      data: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar,
        email: admin.email,
        phone: admin.phone,
        lastLoginTime: admin.lastLoginTime,
      },
    });
  } catch (e: any) {
    console.error('[获取管理员信息错误]', e);
    res.json({ code: 500, msg: e.message || '获取信息失败', data: null });
  }
});

// POST /api/auth/logout - 登出
router.post('/logout', authRequired, async (req, res) => {
  try {
    if (req.admin) {
      await logOperation({
        adminId: req.admin.id,
        adminName: req.admin.name,
        module: '认证',
        action: '登出',
        target: req.admin.username,
        ip: req.ip,
      });
    }
    res.json({ code: 0, msg: '登出成功', data: null });
  } catch (e: any) {
    console.error('[登出错误]', e);
    res.json({ code: 500, msg: e.message || '登出失败', data: null });
  }
});

export default router;
