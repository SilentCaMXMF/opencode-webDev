const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Load fixtures
const fixturesPath = path.join(__dirname, 'fixtures');
const loadFixtures = () => {
  const fixtures = {};
  if (fs.existsSync(fixturesPath)) {
    const files = fs.readdirSync(fixturesPath);
    files.forEach(file => {
      const key = file.replace('.json', '');
      fixtures[key] = JSON.parse(
        fs.readFileSync(path.join(fixturesPath, file), 'utf8')
      );
    });
  }
  return fixtures;
};

let fixtures = loadFixtures();

// Reload fixtures endpoint
app.post('/reload-fixtures', (req, res) => {
  fixtures = loadFixtures();
  res.json({ success: true, message: 'Fixtures reloaded', count: Object.keys(fixtures).length });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), fixtures: Object.keys(fixtures) });
});

// GitHub API mocks
app.get('/api/github/users/:username/repos', (req, res) => {
  const { username } = req.params;
  const repos = fixtures.github_repos || [];

  const filteredRepos = repos.map(repo => ({
    ...repo,
    name: repo.name || `mock-repo-${Math.random().toString(36).substr(2, 9)}`,
    full_name: `${username}/${repo.name || 'mock-repo'}`,
    html_url: `https://github.com/${username}/${repo.name || 'mock-repo'}`,
    description: repo.description || 'Mock repository for testing',
    language: repo.language || 'JavaScript',
    stargazers_count: repo.stargazers_count || 0,
    updated_at: repo.updated_at || new Date().toISOString(),
  }));

  res.json(filteredRepos);
});

// User profile mocks
app.get('/api/github/users/:username', (req, res) => {
  const userProfile = fixtures.github_user || {
    login: req.params.username,
    name: 'Mock User',
    bio: 'Mock user for testing',
    public_repos: 10,
    followers: 100,
    following: 50,
    created_at: new Date().toISOString(),
  };
  res.json(userProfile);
});

// Mock data endpoints
app.get('/mock/:fixture', (req, res) => {
  const { fixture } = req.params;
  if (fixtures[fixture]) {
    res.json(fixtures[fixture]);
  } else {
    res.status(404).json({ error: 'Fixture not found', fixture });
  }
});

// Dynamic mock responses based on request
app.all('/mock/responses', (req, res) => {
  const responses = fixtures.mock_responses || [];
  const { method, path } = req;

  const response = responses.find(r => r.method.toLowerCase() === method.toLowerCase() && r.path === path);

  if (response) {
    res.status(response.status || 200).json(response.body);
  } else {
    res.status(404).json({ error: 'No matching mock response' });
  }
});

// Error simulation
app.get('/mock/error/:status', (req, res) => {
  const { status } = req.params;
  res.status(parseInt(status)).json({ error: `Simulated ${status} error` });
});

// Delay simulation
app.get('/mock/delay/:ms', (req, res) => {
  const { ms } = req.params;
  setTimeout(() => {
    res.json({ message: `Delayed response by ${ms}ms` });
  }, parseInt(ms));
});

// Static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Available fixtures: ${Object.keys(fixtures).join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down mock server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down mock server...');
  process.exit(0);
});
