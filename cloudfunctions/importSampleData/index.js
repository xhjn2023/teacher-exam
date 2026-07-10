/**
 * 导入示例题库数据（幂等，重复执行不会重复插入）
 * 部署后调用一次即可
 */
var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function () {
  var result = { inserted: {}, errors: [] };

  // ==================== 考试类型 ====================
  var examTypes = [
    { _id: 'exam_01', name: '教师资格证', icon: '', sort: 1, subjects: ['sub_01', 'sub_02'], desc: '幼儿园/小学/中学教师资格', createTime: new Date() },
    { _id: 'exam_02', name: '教师招聘', icon: '', sort: 2, subjects: ['sub_03', 'sub_04'], desc: '各地区教师编制招聘考试', createTime: new Date() },
    { _id: 'exam_03', name: '特岗教师', icon: '', sort: 3, subjects: ['sub_05'], desc: '农村义务教育阶段特设岗位', createTime: new Date() }
  ];
  result.inserted.exam_types = await upsertAll('exam_types', examTypes);

  // ==================== 科目 ====================
  var subjects = [
    { _id: 'sub_01', examTypeId: 'exam_01', name: '综合素质', icon: '', sort: 1, questionCount: 120, createTime: new Date() },
    { _id: 'sub_02', examTypeId: 'exam_01', name: '教育知识与能力', icon: '', sort: 2, questionCount: 150, createTime: new Date() },
    { _id: 'sub_03', examTypeId: 'exam_02', name: '教育综合知识', icon: '', sort: 1, questionCount: 200, createTime: new Date() },
    { _id: 'sub_04', examTypeId: 'exam_02', name: '学科专业知识', icon: '', sort: 2, questionCount: 180, createTime: new Date() },
    { _id: 'sub_05', examTypeId: 'exam_03', name: '教育理论基础', icon: '', sort: 1, questionCount: 160, createTime: new Date() }
  ];
  result.inserted.subjects = await upsertAll('subjects', subjects);

  // ==================== 章节 ====================
  var chapters = [
    { _id: 'ch_01', subjectId: 'sub_01', name: '职业理念', sort: 1, questionCount: 25, createTime: new Date() },
    { _id: 'ch_02', subjectId: 'sub_01', name: '教育法律法规', sort: 2, questionCount: 30, createTime: new Date() },
    { _id: 'ch_03', subjectId: 'sub_01', name: '教师职业道德规范', sort: 3, questionCount: 20, createTime: new Date() },
    { _id: 'ch_04', subjectId: 'sub_01', name: '文化素养', sort: 4, questionCount: 25, createTime: new Date() },
    { _id: 'ch_05', subjectId: 'sub_01', name: '基本能力', sort: 5, questionCount: 20, createTime: new Date() },
    { _id: 'ch_06', subjectId: 'sub_02', name: '教育学原理', sort: 1, questionCount: 35, createTime: new Date() },
    { _id: 'ch_07', subjectId: 'sub_02', name: '心理学基础', sort: 2, questionCount: 30, createTime: new Date() },
    { _id: 'ch_08', subjectId: 'sub_02', name: '教育心理学', sort: 3, questionCount: 35, createTime: new Date() },
    { _id: 'ch_09', subjectId: 'sub_02', name: '德育与班级管理', sort: 4, questionCount: 25, createTime: new Date() },
    { _id: 'ch_10', subjectId: 'sub_02', name: '教育评价与改革', sort: 5, questionCount: 25, createTime: new Date() },
    { _id: 'ch_11', subjectId: 'sub_03', name: '教育学', sort: 1, questionCount: 50, createTime: new Date() },
    { _id: 'ch_12', subjectId: 'sub_03', name: '心理学', sort: 2, questionCount: 40, createTime: new Date() },
    { _id: 'ch_13', subjectId: 'sub_03', name: '教育法规', sort: 3, questionCount: 30, createTime: new Date() },
    { _id: 'ch_14', subjectId: 'sub_03', name: '新课改理念', sort: 4, questionCount: 40, createTime: new Date() }
  ];
  result.inserted.chapters = await upsertAll('chapters', chapters);

  // ==================== 题目 ====================
  var questions = [
    {
      _id: 'q_001', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_01',
      type: 'single', difficulty: 2, source: '2023上教资真题',
      question: '<p>素质教育是以<span style="color:red">提高民族素质</span>为宗旨的教育，它面向</p>',
      options: [
        { label: 'A', text: '全体学生' },
        { label: 'B', text: '优秀学生' },
        { label: 'C', text: '后进学生' },
        { label: 'D', text: '有特长的学生' }
      ],
      answer: 'A',
      analysis: '<p>素质教育是面向全体学生的教育，强调促进每个学生的发展，而不是只关注少数优秀学生或后进生。</p>',
      knowledgeTags: [{ name: '素质教育', detail: '素质教育以提高国民素质为根本宗旨，面向全体学生，促进学生全面发展与个性发展。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_002', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_01',
      type: 'single', difficulty: 3, source: '2022下教资真题',
      question: '<p>"以人为本"的学生观要求教师</p>',
      options: [
        { label: 'A', text: '把学生看作知识的容器' },
        { label: 'B', text: '把学生看作被动接受者' },
        { label: 'C', text: '把学生看作发展的人' },
        { label: 'D', text: '把学生看作标准化的产品' }
      ],
      answer: 'C',
      analysis: '<p>"以人为本"的学生观认为学生是发展的人、独特的人、具有独立意义的人。教师应尊重学生的个体差异，促进其主动发展。</p>',
      knowledgeTags: [{ name: '学生观', detail: '以人为本的学生观：学生是发展的人、独特的人、独立意义的人。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_003', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_01',
      type: 'single', difficulty: 2,
      question: '<p>教师职业的最大特点是职业角色的</p>',
      options: [
        { label: 'A', text: '单一性' },
        { label: 'B', text: '示范性' },
        { label: 'C', text: '多样性' },
        { label: 'D', text: '创造性' }
      ],
      answer: 'C',
      analysis: '<p>教师职业角色的最大特点是多样化。教师不仅是知识的传授者，还是学生的引导者、管理者、研究者等。</p>',
      knowledgeTags: [{ name: '教师角色', detail: '教师职业角色具有多样化的特点。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_004', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_01',
      type: 'judge', difficulty: 1,
      question: '<p>素质教育就是让学生什么都学、什么都学好。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'B',
      analysis: '<p>素质教育不是要求所有学生什么都学、什么都学好，而是强调在全面发展的基础上，促进学生的个性发展和特长培养。</p>',
      knowledgeTags: [{ name: '素质教育', detail: '素质教育强调全面发展与个性发展相结合。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_005', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_02',
      type: 'single', difficulty: 3, source: '2023上教资真题',
      question: '<p>《中华人民共和国教育法》规定，我国实行的学校教育制度是</p>',
      options: [
        { label: 'A', text: '学前教育、初等教育、中等教育、高等教育' },
        { label: 'B', text: '幼儿教育、基础教育、高等教育' },
        { label: 'C', text: '小学教育、中学教育、大学教育' },
        { label: 'D', text: '义务教育、高中教育、职业教育' }
      ],
      answer: 'A',
      analysis: '<p>《教育法》第十七条规定：国家实行学前教育、初等教育、中等教育、高等教育的学校教育制度。</p>',
      knowledgeTags: [{ name: '教育制度', detail: '我国学校教育制度分为学前教育、初等教育、中等教育、高等教育四个层次。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_006', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_02',
      type: 'single', difficulty: 2,
      question: '<p>教师应当履行"不断提高思想政治觉悟和教育教学业务水平"的义务，这属于</p>',
      options: [
        { label: 'A', text: '公民义务' },
        { label: 'B', text: '教育义务' },
        { label: 'C', text: '职业道德义务' },
        { label: 'D', text: '法律义务' }
      ],
      answer: 'D',
      analysis: '<p>《教师法》第八条明确规定了教师应履行的六项义务，其中包含"不断提高思想政治觉悟和教育教学业务水平"，这是法律义务。</p>',
      knowledgeTags: [{ name: '教师义务', detail: '教师的义务由《教师法》明确规定，属于法律义务。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_007', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_06',
      type: 'single', difficulty: 3, source: '2023上教资真题',
      question: '<p>提出"教育即生活""学校即社会""从做中学"的教育家是</p>',
      options: [
        { label: 'A', text: '赫尔巴特' },
        { label: 'B', text: '杜威' },
        { label: 'C', text: '夸美纽斯' },
        { label: 'D', text: '卢梭' }
      ],
      answer: 'B',
      analysis: '<p>杜威是实用主义教育学的代表人物，提出了"教育即生活""学校即社会""从做中学"三大核心教育理念。</p>',
      knowledgeTags: [{ name: '杜威', detail: '杜威(Dewey)实用主义教育学：教育即生活、学校即社会、从做中学。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_008', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_06',
      type: 'single', difficulty: 2,
      question: '<p>教育学作为一门独立学科的标志是</p>',
      options: [
        { label: 'A', text: '《大教学论》的出版' },
        { label: 'B', text: '《普通教育学》的出版' },
        { label: 'C', text: '《教育漫话》的出版' },
        { label: 'D', text: '《民主主义与教育》的出版' }
      ],
      answer: 'A',
      analysis: '<p>夸美纽斯的《大教学论》（1632年）标志着教育学开始成为一门独立的学科。赫尔巴特的《普通教育学》标志着教育学成为一门规范的学科。</p>',
      knowledgeTags: [{ name: '教育学的独立', detail: '《大教学论》——教育学成为独立学科的标志；《普通教育学》——教育学成为规范学科的标志。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_009', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_07',
      type: 'single', difficulty: 3, source: '2022下教资真题',
      question: '<p>小明听到音乐就会不由自主地跟着节奏晃动身体，这种心理现象属于</p>',
      options: [
        { label: 'A', text: '感觉' },
        { label: 'B', text: '知觉' },
        { label: 'C', text: '注意' },
        { label: 'D', text: '联觉' }
      ],
      answer: 'D',
      analysis: '<p>联觉是指一种感觉引起另一种感觉的心理现象。听到音乐（听觉）引起身体晃动（动觉），属于联觉。</p>',
      knowledgeTags: [{ name: '感觉与知觉', detail: '联觉是一种感觉引发出另一种感觉的现象。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_010', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_07',
      type: 'multi', difficulty: 4,
      question: '<p>下列属于无意注意的影响因素的是</p>',
      options: [
        { label: 'A', text: '刺激物的强度' },
        { label: 'B', text: '刺激物的对比关系' },
        { label: 'C', text: '个人的兴趣和需要' },
        { label: 'D', text: '活动的目的和任务' },
        { label: 'E', text: '对活动的间接兴趣' }
      ],
      answer: 'ABC',
      analysis: '<p>无意注意的影响因素包括客观因素（刺激物的强度、对比关系、新异性、运动变化等）和主观因素（个人的需要、兴趣、情绪状态等）。D和E指向有意注意。</p>',
      knowledgeTags: [{ name: '注意的种类', detail: '无意注意受主客观因素影响；有意注意受目的任务和间接兴趣影响。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_011', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_11',
      type: 'single', difficulty: 3, source: '2023教师招聘真题',
      question: '<p>教学过程是一种特殊的认识过程，其特殊性表现在</p>',
      options: [
        { label: 'A', text: '间接性与简捷性' },
        { label: 'B', text: '直观性与巩固性' },
        { label: 'C', text: '启发性与循序性' },
        { label: 'D', text: '思维性与实践性' }
      ],
      answer: 'A',
      analysis: '<p>教学过程的特殊性主要体现在：间接性（以学习间接经验为主）、简捷性（快速掌握）、引导性（教师引导）、教育性（教书育人）。</p>',
      knowledgeTags: [{ name: '教学过程', detail: '教学过程的特殊性：间接性、简捷性、引导性、教育性。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_012', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_11',
      type: 'single', difficulty: 2,
      question: '<p>"不愤不启，不悱不发"体现了什么教学原则？</p>',
      options: [
        { label: 'A', text: '循序渐进原则' },
        { label: 'B', text: '启发性原则' },
        { label: 'C', text: '因材施教原则' },
        { label: 'D', text: '巩固性原则' }
      ],
      answer: 'B',
      analysis: '<p>"不愤不启，不悱不发"出自《论语》，意思是学生不冥思苦想就不去启发他，不表达不出来就不去开导他。体现了启发性教学原则。</p>',
      knowledgeTags: [{ name: '教学原则', detail: '启发性原则是指在教学中教师要激发学生的学习主动性，引导他们独立思考。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_013', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_12',
      type: 'single', difficulty: 3,
      question: '<p>艾宾浩斯遗忘曲线揭示的遗忘规律是</p>',
      options: [
        { label: 'A', text: '先慢后快' },
        { label: 'B', text: '先快后慢' },
        { label: 'C', text: '匀速递减' },
        { label: 'D', text: '波浪式变化' }
      ],
      answer: 'B',
      analysis: '<p>艾宾浩斯遗忘曲线表明：遗忘的进程是不均衡的，呈现"先快后慢"的趋势。在记忆后的最初阶段遗忘速度最快，之后逐渐减慢。</p>',
      knowledgeTags: [{ name: '遗忘规律', detail: '艾宾浩斯遗忘曲线：遗忘先快后慢，及时复习可有效防止遗忘。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_014', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_12',
      type: 'judge', difficulty: 2,
      question: '<p>智力水平越高，创造力水平就越高。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'B',
      analysis: '<p>智力与创造力的关系是：高智力是创造力的必要条件，但不是充分条件。高智力不一定高创造力，但低智力一定低创造力。</p>',
      knowledgeTags: [{ name: '智力与创造力', detail: '高智力是高创造力的必要条件而非充分条件。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_015', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_13',
      type: 'single', difficulty: 3, source: '2022教师招聘真题',
      question: '<p>根据《中华人民共和国教师法》，教师的平均工资水平应当</p>',
      options: [
        { label: 'A', text: '不低于当地公务员平均水平' },
        { label: 'B', text: '不低于国家公务员平均水平' },
        { label: 'C', text: '不低于当地公务员水平' },
        { label: 'D', text: '不低于国家公务员水平' }
      ],
      answer: 'A',
      analysis: '<p>《教师法》第二十五条规定：教师的平均工资水平应当不低于或者高于国家公务员的平均工资水平，并逐步提高。具体执行以"不低于当地公务员平均水平"为准。</p>',
      knowledgeTags: [{ name: '教师权益', detail: '教师工资不低于当地公务员平均水平。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_016', examTypeId: 'exam_03', subjectId: 'sub_05', chapterId: 'ch_11',
      type: 'single', difficulty: 3, source: '2023特岗真题',
      question: '<p>特岗教师聘期一般为</p>',
      options: [
        { label: 'A', text: '1年' },
        { label: 'B', text: '2年' },
        { label: 'C', text: '3年' },
        { label: 'D', text: '5年' }
      ],
      answer: 'C',
      analysis: '<p>特岗教师聘期一般为3年。服务期满且考核合格，可按照规定办理编制、接续工龄等。</p>',
      knowledgeTags: [{ name: '特岗政策', detail: '特岗教师服务期为3年。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_017', examTypeId: 'exam_03', subjectId: 'sub_05', chapterId: 'ch_11',
      type: 'essay', difficulty: 4,
      question: '<p>结合实际，谈谈如何促进教育公平？</p>',
      options: [],
      answer: '<p>促进教育公平的措施包括：</p><p>1. 均衡配置教育资源，加大对农村和薄弱学校的投入；</p><p>2. 推进义务教育均衡发展，缩小城乡、区域、校际差距；</p><p>3. 保障特殊群体受教育权利，如随迁子女、留守儿童等；</p><p>4. 完善资助体系，不让一个学生因家庭经济困难而失学；</p><p>5. 提高教育信息化水平，让优质教育资源惠及更多学生。</p>',
      analysis: '<p>教育公平是社会公平的重要基础。包括机会公平、过程公平和结果公平三个层次。</p>',
      knowledgeTags: [{ name: '教育公平', detail: '教育公平包括机会公平、过程公平、结果公平三个层次。' }],
      createTime: new Date(), updateTime: new Date()
    }
  ];
  result.inserted.questions = await upsertAll('questions', questions);

  return result;
};

/** 幂等插入：按 _id 去重 */
async function upsertAll(collectionName, docs) {
  var inserted = 0, skipped = 0;
  for (var i = 0; i < docs.length; i++) {
    try {
      var existing = await db.collection(collectionName).doc(docs[i]._id).get();
      if (existing.data) {
        skipped++;
      } else {
        await db.collection(collectionName).add({ data: docs[i] });
        inserted++;
      }
    } catch (e) {
      // doc 不存在会抛出错误，此时直接插入
      try {
        await db.collection(collectionName).add({ data: docs[i] });
        inserted++;
      } catch (e2) {
        // 可能重复添加错误
        skipped++;
      }
    }
  }
  return { inserted: inserted, skipped: skipped, total: docs.length };
}
