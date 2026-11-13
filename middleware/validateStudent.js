const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9\s-]{7,14}$/;

function validateStudent({ partial = false } = {}) {
  return (req, res, next) => {
    const body = req.body || {};
    const fields = ['fullName', 'age', 'email', 'course', 'semester', 'phone'];
    const errors = [];
    if (!partial) fields.forEach((field) => {
      if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') errors.push(`${field} is required`);
    });
    if (body.fullName !== undefined && (typeof body.fullName !== 'string' || body.fullName.trim().length < 2)) errors.push('fullName must contain at least 2 characters');
    if (body.age !== undefined && (!Number.isInteger(body.age) || body.age < 15 || body.age > 100)) errors.push('age must be an integer between 15 and 100');
    if (body.email !== undefined && (typeof body.email !== 'string' || !emailPattern.test(body.email.trim()))) errors.push('email must be valid');
    if (body.course !== undefined && (typeof body.course !== 'string' || body.course.trim().length < 2)) errors.push('course must contain at least 2 characters');
    if (body.semester !== undefined && (!Number.isInteger(body.semester) || body.semester < 1 || body.semester > 8)) errors.push('semester must be an integer between 1 and 8');
    if (body.phone !== undefined && (typeof body.phone !== 'string' || !phonePattern.test(body.phone.trim()))) errors.push('phone must be a valid phone number');
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });
    next();
  };
}

module.exports = validateStudent;
