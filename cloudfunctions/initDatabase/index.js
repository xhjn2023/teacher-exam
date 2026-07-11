/**
 * 初始化数据库 — 创建全部 9 个集合（幂等，可重复执行）
 * 上传部署后，在云开发控制台调用一次即可
 */
var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function () {
  var result = { created: [], existed: [], errors: [] };

  // 需要创建的集合列表及索引说明
  var collections = [
    { name: 'exam_types', desc: '考试类型（教资/教招/特岗）' },
    { name: 'subjects', desc: '科目' },
    { name: 'chapters', desc: '章节' },
    { name: 'questions', desc: '题目库（核心）' },
    { name: 'real_papers', desc: '真题套卷' },
    { name: 'user_progress', desc: '用户学习数据' },
    { name: 'user_answers', desc: '用户答题记录' },
    { name: 'user_favorites', desc: '用户收藏' },
    { name: 'user_error_book', desc: '错题本' },
    { name: 'user_checkin', desc: '签到记录' },
    { name: 'question_reports', desc: '题目报错反馈' }
  ];

  for (var i = 0; i < collections.length; i++) {
    var col = collections[i];
    try {
      await db.createCollection(col.name);
      result.created.push(col.name + ' — ' + col.desc);
    } catch (e) {
      if (e.errCode === 'DATABASE_COLLECTION_ALREADY_EXISTS' || 
          (e.message && e.message.indexOf('already exists') >= 0)) {
        result.existed.push(col.name);
      } else {
        result.errors.push(col.name + ': ' + (e.message || e.errMsg || '未知错误'));
      }
    }
  }

  return result;
};
