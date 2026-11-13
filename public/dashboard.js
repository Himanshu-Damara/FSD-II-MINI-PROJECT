const dashboardApi = '/api/students';
const dashboard$ = (id) => document.getElementById(id);
const safeText = (value) => String(value ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
async function loadDashboard() {
  try {
    const response = await fetch(dashboardApi, { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'API request failed');
    const students = result.data || [];
    dashboard$('total').textContent = result.count;
    dashboard$('courses').textContent = new Set(students.map((student) => student.course)).size;
    dashboard$('latest').textContent = students[0] ? new Date(students[0].updatedAt).toLocaleDateString() : '—';
    dashboard$('status').textContent = '● API connected';
    dashboard$('recentRows').innerHTML = students.length ? students.slice(0, 5).map((student) => `<tr><td><span class="small">${safeText(student.id)}</span></td><td><strong>${safeText(student.fullName)}</strong><br><span class="small">Age ${student.age} · ${safeText(student.phone)}</span></td><td>${safeText(student.course)}</td><td>Semester ${student.semester}</td><td>${safeText(student.email)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty">No students found.</td></tr>';
  } catch (error) { dashboard$('status').textContent = '● API unavailable'; dashboard$('recentRows').innerHTML = `<tr><td colspan="5" class="empty">${safeText(error.message)}</td></tr>`; }
}
loadDashboard();
