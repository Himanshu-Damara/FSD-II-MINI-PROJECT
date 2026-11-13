const { readStudents } = require('../services/studentStore');

async function getStats(req, res, next) {
  try {
    const students = await readStudents();
    const courseCounts = {};
    const semesterCounts = {};
    students.forEach((student) => {
      courseCounts[student.course] = (courseCounts[student.course] || 0) + 1;
      semesterCounts[student.semester] = (semesterCounts[student.semester] || 0) + 1;
    });
    res.json({ success: true, data: { totalStudents: students.length, totalCourses: Object.keys(courseCounts).length, courseCounts, semesterCounts, latestStudent: students.at(-1) || null } });
  } catch (err) { next(err); }
}

module.exports = { getStats };
