const Task   = require('../models/Task');
const Exam   = require('../models/Exam');
const Course = require('../models/Course');

class AIRecommendationService {
  async generatePlan(userId) {
    const tasks   = await Task.findAll({ where: { userId, status: ['pending', 'in_progress'] } });
    const exams   = await Exam.findAll({ where: { userId } });
    const courses = await Course.findAll({ where: { userId } });
    const context = this.buildContext(tasks, exams, courses);
    const blocks  = this.prioritize(context);
    const summary = this.buildSummary(blocks, tasks, courses);
    return { blocks, summary, generatedAt: new Date() };
  }

  buildContext(tasks, exams, courses) {
    const upcomingExams = exams
      .map(e => ({ ...e.toJSON(), daysLeft: this.daysUntil(e.examDate) }))
      .filter(e => e.daysLeft >= 0 && e.daysLeft <= 14)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const urgentTasks = tasks
      .filter(t => t.dueDate && this.daysUntil(t.dueDate) <= 3)
      .sort((a, b) => b.priority - a.priority);

    const courseWeights = courses.map(c => {
      const ct         = tasks.filter(t => t.courseId === c.id);
      const done       = ct.filter(t => t.status === 'done').length;
      const completion = ct.length ? done / ct.length : 0;
      const diffMulti  = { easy: 1, medium: 1.5, hard: 2 }[c.difficulty] || 1;
      return { id: c.id, name: c.name, weight: c.credits * diffMulti, completion: Math.round(completion * 100) };
    });

    return { upcomingExams, urgentTasks, courseWeights };
  }

  prioritize({ upcomingExams, urgentTasks, courseWeights }) {
    const blocks = [];

    upcomingExams.forEach(exam => {
      const hours  = exam.daysLeft <= 1 ? 4 : exam.daysLeft <= 3 ? 3 : exam.daysLeft <= 7 ? 2 : 1;
      const course = courseWeights.find(c => c.id === exam.courseId);
      blocks.push({ type: 'exam_prep', title: `Exam Prep: ${exam.title}`, courseId: exam.courseId, courseName: course?.name || 'Unknown', hours, priority: Math.max(1, 10 - exam.daysLeft), daysLeft: exam.daysLeft, reason: `Exam in ${exam.daysLeft} day(s)` });
    });

    urgentTasks.forEach(task => {
      const daysLeft = task.dueDate ? this.daysUntil(task.dueDate) : 999;
      const course   = courseWeights.find(c => c.id === task.courseId);
      blocks.push({ type: 'task', title: task.title, taskId: task.id, courseId: task.courseId, courseName: course?.name || 'General', hours: task.estimatedHours || 1, priority: task.priority + (daysLeft <= 1 ? 5 : 2), daysLeft, reason: `Due in ${daysLeft} day(s)` });
    });

    courseWeights.filter(c => c.completion < 50 && c.weight > 1).sort((a, b) => b.weight - a.weight).slice(0, 2).forEach(course => {
      if (!blocks.some(b => b.courseId === course.id)) {
        blocks.push({ type: 'review', title: `Review: ${course.name}`, courseId: course.id, courseName: course.name, hours: 1, priority: Math.round(course.weight), reason: `Only ${course.completion}% completed` });
      }
    });

    return blocks.sort((a, b) => b.priority - a.priority).slice(0, 8);
  }

  buildSummary(blocks, tasks, courses) {
    const totalHours      = blocks.reduce((s, b) => s + b.hours, 0);
    const doneCount       = tasks.filter(t => t.status === 'done').length;
    const allTasks        = tasks;
    const overallProgress = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;
    return { totalStudyHours: totalHours, blockCount: blocks.length, overallProgress, topCourse: courses[0]?.name || null };
  }

  daysUntil(date) {
    return Math.ceil((new Date(date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
  }
}

module.exports = new AIRecommendationService();
