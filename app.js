import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { schedulePing, stopPing, getLogs } from './pinger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('index', { message: null });
});

app.post('/start', (req, res) => {
  const { url, interval } = req.body;
  const success = schedulePing(url, parseInt(interval));
  res.render('index', { message: success ? `\u2705 Started pinging ${url} every ${interval} minutes.` : `\u26a0\ufe0f Already pinging ${url}.` });
});

app.post('/stop', (req, res) => {
  const { url } = req.body;
  const success = stopPing(url);
  res.render('index', { message: success ? `\u274c Stopped pinging ${url}.` : `\u26a0\ufe0f ${url} was not being pinged.` });
});

app.get('/logs', (req, res) => {
  const url = req.query.url;
  const urlLogs = getLogs(url);
  res.render('logs', { url, urlLogs });
});

app.listen(PORT, () => console.log(`\u2705 Server running on http://localhost:${PORT}`));