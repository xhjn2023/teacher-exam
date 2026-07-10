/**
 * 全局配置常量
 */
module.exports = {
  // 云开发环境 ID
  CLOUD_ENV: 'teacher-exam-xxxxx',

  // 分页默认值
  DEFAULT_PAGE_SIZE: 20,
  REAL_PAPER_PAGE_SIZE: 15,
  RECITE_PAGE_SIZE: 10,

  // 缓存过期时间（毫秒）
  CACHE_TTL: {
    EXAM_TYPES: 24 * 60 * 60 * 1000,
    SUBJECTS: 24 * 60 * 60 * 1000,
    CHAPTERS: 24 * 60 * 60 * 1000,
    QUESTIONS: 60 * 60 * 1000,
    REAL_PAPERS: 24 * 60 * 60 * 1000,
    QUESTION_DETAIL: 60 * 60 * 1000
  },

  // 缓存 Key
  CACHE_KEYS: {
    EXAM_TYPES: 'exam_types',
    SUBJECTS_PREFIX: 'subjects_',
    CHAPTERS_PREFIX: 'chapters_',
    QUESTIONS_PREFIX: 'questions_',
    QUESTION_DETAIL_PREFIX: 'question_',
    PAPER_PREFIX: 'paper_',
    OFFLINE_ANSWERS: 'offline_answers',
    USER_SETTINGS: 'user_settings',
    USER_PROGRESS: 'user_progress'
  },

  // 题目类型
  QUESTION_TYPES: {
    SINGLE: 'single',
    MULTI: 'multi',
    JUDGE: 'judge',
    FILL: 'fill',
    ESSAY: 'essay',
    EXPLAIN: 'explain'
  },

  // 题目类型中文
  TYPE_LABELS: {
    single: '单选题',
    multi: '多选题',
    judge: '判断题',
    fill: '填空题',
    essay: '简答题',
    explain: '论述题'
  },

  // 模拟考场默认配置
  MOCK_EXAM_DEFAULTS: {
    TOTAL_COUNT: 100,
    DURATION: 120
  },

  // Toast 时长
  TOAST: {
    QUICK: 1000,
    NORMAL: 2000,
    LONG: 3000
  }
};
