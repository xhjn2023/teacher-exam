import { db, isDbAvailable, COLLECTIONS } from '../cloudbase.js';

// 操作日志参数
interface LogParams {
  adminId: string;
  adminName: string;
  module: string;
  action: string;
  target: string;
  detail?: string;
  ip?: string;
}

// 记录操作日志（写入云数据库，失败则降级到控制台）
export async function logOperation(params: LogParams): Promise<void> {
  const logData = {
    ...params,
    detail: params.detail || '',
    ip: params.ip || '',
    createTime: new Date().toISOString(),
  };

  // 云数据库可用时写入集合
  if (isDbAvailable() && db) {
    try {
      await db.collection(COLLECTIONS.OPERATION_LOGS).add({ data: logData });
      return;
    } catch (e) {
      console.error('[日志] 写入云数据库失败，降级到控制台:', e);
    }
  }

  // 降级：输出到控制台
  console.log('[操作日志]', JSON.stringify(logData));
}
