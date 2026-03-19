const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };
  console.error(err.stack?.split('\n')[0]);

  if (err.name === 'CastError')
    return res.status(404).json({ success: false, error: 'Resource not found' });

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ success: false, error: `${field} already exists` });
  }

  if (err.name === 'ValidationError')
    return res.status(400).json({
      success: false,
      error: Object.values(err.errors).map(e => e.message).join(', '),
    });

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
