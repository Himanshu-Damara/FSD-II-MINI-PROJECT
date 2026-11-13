const fs = require('fs').promises;
const path = require('path');
const filePath = path.join(__dirname, '..', 'data', 'students.json');
let queue = Promise.resolve();

async function readStudents() {
  try { return JSON.parse(await fs.readFile(filePath, 'utf8')); }
  catch (err) { if (err.code === 'ENOENT') { await writeStudents([]); return []; } throw err; }
}
async function writeStudents(students) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.tmp`;
  await fs.writeFile(temp, JSON.stringify(students, null, 2) + '\n', 'utf8');
  await fs.rename(temp, filePath);
}
function withWriteLock(operation) {
  const result = queue.then(operation);
  queue = result.catch(() => {});
  return result;
}
function createId(students) {
  const usedNumbers = new Set(students.map((student) => {
    const match = /^STU-(\d+)$/i.exec(student.id);
    return match ? Number(match[1]) : null;
  }).filter(Boolean));
  let nextNumber = 1001;
  while (usedNumbers.has(nextNumber)) nextNumber += 1;
  return `STU-${nextNumber}`;
}
module.exports = { readStudents, writeStudents, withWriteLock, createId };
