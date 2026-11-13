const { readStudents, writeStudents, withWriteLock, createId } = require('../services/studentStore');

const normalize = (body) => ({
  fullName: body.fullName.trim(), age: body.age, email: body.email.trim().toLowerCase(),
  course: body.course.trim().toUpperCase(), semester: body.semester, phone: body.phone.trim()
});
const notFound = () => Object.assign(new Error('Student not found'), { statusCode: 404 });

async function getStudents(req, res, next) {
  try {
    let students = await readStudents();
    const search = String(req.query.search || '').trim().toLowerCase();
    const course = String(req.query.course || '').trim().toLowerCase();
    if (search) students = students.filter((s) => s.fullName.toLowerCase().includes(search));
    if (course) students = students.filter((s) => s.course.toLowerCase() === course);
    res.json({ success: true, count: students.length, data: students });
  } catch (err) { next(err); }
}
async function getStudent(req, res, next) {
  try { const student = (await readStudents()).find((s) => s.id.toLowerCase() === req.params.id.toLowerCase()); if (!student) throw notFound(); res.json({ success: true, data: student }); }
  catch (err) { next(err); }
}
async function createStudent(req, res, next) {
  try {
    const data = normalize(req.body);
    const student = await withWriteLock(async () => {
      const students = await readStudents();
      if (students.some((s) => s.email === data.email)) throw Object.assign(new Error('A student with this email already exists'), { statusCode: 400 });
      const now = new Date().toISOString();
      const created = { id: createId(students), ...data, createdAt: now, updatedAt: now };
      await writeStudents([...students, created]); return created;
    });
    res.status(201).json({ success: true, message: 'Student created successfully', data: student });
  } catch (err) { next(err); }
}
async function updateStudent(req, res, next) {
  try {
    const updated = await withWriteLock(async () => {
      const students = await readStudents(); const index = students.findIndex((s) => s.id.toLowerCase() === req.params.id.toLowerCase());
      if (index < 0) throw notFound();
      const data = normalize(req.body); if (students.some((s, i) => i !== index && s.email === data.email)) throw Object.assign(new Error('A student with this email already exists'), { statusCode: 400 });
      const student = { ...students[index], ...data, updatedAt: new Date().toISOString() }; students[index] = student; await writeStudents(students); return student;
    });
    res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (err) { next(err); }
}
async function deleteStudent(req, res, next) {
  try {
    const deleted = await withWriteLock(async () => { const students = await readStudents(); const index = students.findIndex((s) => s.id.toLowerCase() === req.params.id.toLowerCase()); if (index < 0) throw notFound(); const [student] = students.splice(index, 1); await writeStudents(students); return student; });
    res.json({ success: true, message: 'Student deleted successfully', data: deleted });
  } catch (err) { next(err); }
}
module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };
