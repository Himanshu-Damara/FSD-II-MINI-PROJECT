module.exports = (err, req, res, next) => {
  console.error(err.stack || err);
  if (res.headersSent) return next(err);
  const isMalformedJson = err instanceof SyntaxError && err.type === 'entity.parse.failed';
  const isTooLarge = err.type === 'entity.too.large';
  const status = isMalformedJson ? 400 : (isTooLarge ? 413 : (err.statusCode || 500));
  res.status(status).json({
    success: false,
    message: isMalformedJson ? 'Malformed JSON request body' : (isTooLarge ? 'Request body is too large' : (status === 500 ? 'Internal server error' : err.message))
  });
};
