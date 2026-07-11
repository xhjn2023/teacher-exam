import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 扩展 Request 类型，附加管理员信息
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        username: string;
        name: string;
        role: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'teacher-admin-jwt-secret';

// JWT 认证中间件
export function authRequired(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ code: 401, msg: '未提供认证 token', data: null });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      name: string;
      role: string;
    };
    req.admin = {
      id: decoded.id,
      username: decoded.username,
      name: decoded.name,
      role: decoded.role,
    };
    next();
  } catch (e) {
    res.status(401).json({ code: 401, msg: 'token 无效或已过期', data: null });
  }
}

// 生成 JWT token
export function generateToken(payload: {
  id: string;
  username: string;
  name: string;
  role: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
