import tcb from '@cloudbase/node-sdk';

// 云开发环境配置
const SECRET_ID = process.env.TENCENT_SECRET_ID;
const SECRET_KEY = process.env.TENCENT_SECRET_KEY;
const CLOUD_ENV = process.env.CLOUD_ENV || 'cloud1-d3gj1jd5w955949b1';

// 集合名称常量
export const COLLECTIONS = {
  EXAM_TYPES: 'exam_types',
  SUBJECTS: 'subjects',
  CHAPTERS: 'chapters',
  QUESTIONS: 'questions',
  REAL_PAPERS: 'real_papers',
  USER_PROGRESS: 'user_progress',
  USER_ANSWERS: 'user_answers',
  USER_FAVORITES: 'user_favorites',
  USER_ERROR_BOOK: 'user_error_book',
  ADMINS: 'admins',
  OPERATION_LOGS: 'operation_logs',
  SYSTEM_CONFIG: 'system_config',
} as const;

// 数据库对象类型（未配置凭证时为 null）
type DbObject = ReturnType<ReturnType<typeof tcb.init>['database']> | null;

let dbInstance: DbObject = null;
let appInstance: any = null;

// 初始化云开发SDK
if (SECRET_ID && SECRET_KEY && CLOUD_ENV) {
  try {
    appInstance = tcb.init({
      env: CLOUD_ENV,
      secretId: SECRET_ID,
      secretKey: SECRET_KEY,
    });
    dbInstance = appInstance.database();
    console.log('[云开发] 初始化成功，环境:', CLOUD_ENV);
  } catch (e) {
    console.error('[云开发] 初始化失败:', e);
  }
} else {
  console.warn('[云开发] 未配置 TENCENT_SECRET_ID / TENCENT_SECRET_KEY，将降级使用 mock 数据');
}

// 导出 db 对象（可能为 null）
export const db: DbObject = dbInstance;
export const app = appInstance;

// 判断云数据库是否可用
export const isDbAvailable = (): boolean => db !== null;

// 返回未配置提示信息
export const NOT_CONFIGURED_MSG = '云数据库未初始化，请在 server/.env 中配置 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY';
