const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`EduPredict API running on http://127.0.0.1:${PORT}`);
});
