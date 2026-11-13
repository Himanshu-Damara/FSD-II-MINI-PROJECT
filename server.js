require('dotenv').config();
const path = require('path');
const fs = require('fs').promises;
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const { getStats } = require('./controllers/statsController');
const { readStudents } = require('./services/studentStore');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.disable('etag');
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '50kb' }));
app.use(logger);
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.removeHeader('ETag');
  next();
});
app.get('/students.html', async (req, res, next) => {
  try {
    const template = await fs.readFile(path.join(__dirname, 'public', 'students.html'), 'utf8');
    const students = await readStudents();
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
    const rows = students.length ? students.map((student) => `<tr><td><span class="small">${escape(student.id)}</span></td><td><div class="student-name">${escape(student.fullName)}</div><span class="small">Age ${student.age} · ${escape(student.phone)}</span></td><td>${escape(student.course)}</td><td>Semester ${student.semester}</td><td>${escape(student.email)}</td><td><button class="action" onclick='editStudent(${JSON.stringify(student)})'>Edit</button><button class="action delete" onclick="deleteStudent('${escape(student.id)}')">Delete</button></td></tr>`).join('') : '<tr><td colspan="6" class="empty">No students found.</td></tr>';
    res.type('html').send(template.replace(/<tbody id="studentRows">[\s\S]*?<\/tbody>/, `<tbody id="studentRows">${rows}</tbody>`));
  } catch (err) { next(err); }
});
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
}));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Student API is running', timestamp: new Date().toISOString() });
});
app.get('/api/stats', getStats);
app.use('/api/students', studentRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => console.log(`Student API listening on http://localhost:${port}`));
}

module.exports = app;
