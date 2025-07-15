const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

let pingers = {};
let logs = {};

app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


const homeTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ping Server App</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container py-5">
    <div class="card shadow p-4">
      <h1 class="mb-4">🌐 Uptivity - Server Pinger</h1>
       <h2 class="mb-4">Hang on...</h2>

      <% if (message) { %>
        <div class="alert alert-info"><%= message %></div>
      <% } %>

      <form method="POST" action="/start" class="mb-3">
        <div class="mb-3">
          <label class="form-label">Backend URL (Render):</label>
          <input name="url" type="url" class="form-control" placeholder="https://yourapp.onrender.com" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Interval (minutes):</label>
          <input name="interval" type="number" min="1" class="form-control" placeholder="e.g. 5" required>
        </div>
        <button class="btn btn-success" type="submit">Start Pinging</button>
      </form>

      <form method="POST" action="/stop" class="mb-3">
        <div class="mb-3">
          <label class="form-label">URL to Stop Pinging:</label>
          <input name="url" type="url" class="form-control" required>
        </div>
        <button class="btn btn-danger" type="submit">Stop Pinging</button>
      </form>

      <form method="GET" action="/logs">
        <div class="mb-3">
          <label class="form-label">URL to View Logs:</label>
          <input name="url" type="url" class="form-control" required>
        </div>
        <button class="btn btn-primary" type="submit">View Logs</button>
      </form>
    </div>
  </div>
</body>
</html>
`;


const logsTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Logs for <%= url %></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container py-5">
    <div class="card shadow p-4">
      <h2>📝 Logs for:</h2>
      <p><strong><%= url %></strong></p>
      <a class="btn btn-secondary mb-3" href="/">⬅️ Back</a>

      <% if (urlLogs.length === 0) { %>
        <p>No logs available for this URL yet.</p>
      <% } else { %>
        <ul class="list-group">
          <% urlLogs.forEach(log => { %>
            <li class="list-group-item"><%= log %></li>
          <% }) %>
        </ul>
      <% } %>
    </div>
  </div>
</body>
</html>
`;


app.get('/', (req, res) => {
  res.send(require('ejs').render(homeTemplate, { message: null }));
});


app.post('/start', (req, res) => {
  const { url, interval } = req.body;
  const msInterval = parseInt(interval) * 60 * 1000;

  if (pingers[url]) {
    return res.send(require('ejs').render(homeTemplate, { message: 'Already pinging this URL.' }));
  }

  logs[url] = logs[url] || [];

  pingers[url] = setInterval(() => {
    fetch(url)
      .then(() => {
       logs[url].push(
  `[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Pinged ${url} ✅`
);

      })
      .catch(() => {
        logs[url].push(
  `[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Failed to reach ${url} ❌`
);

      });
  }, msInterval);

  res.send(require('ejs').render(homeTemplate, { message: `Started pinging ${url} every ${interval} minute(s).` }));
});


app.post('/stop', (req, res) => {
  const { url } = req.body;
  if (pingers[url]) {
    clearInterval(pingers[url]);
    delete pingers[url];
    res.send(require('ejs').render(homeTemplate, { message: `Stopped pinging ${url}.` }));
  } else {
    res.send(require('ejs').render(homeTemplate, { message: `No active pinging found for ${url}.` }));
  }
});


app.get('/logs', (req, res) => {
  const { url } = req.query;
  const urlLogs = logs[url] || [];
  res.send(require('ejs').render(logsTemplate, { url, urlLogs }));
});


app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
