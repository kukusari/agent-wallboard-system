const express = require('express');
const { getSQLiteDB } = require('../config/database');
const router = express.Router();

// Agent Login
router.post('/login', (req, res) => {
  const { agentCode } = req.body;
  
  if (!agentCode) {
    return res.status(400).json({ error: 'Agent code is required' });
  }

  const db = getSQLiteDB();
  const query = `
    SELECT a.*, t.team_name 
    FROM agents a 
    LEFT JOIN teams t ON a.team_id = t.team_id 
    WHERE a.agent_code = ? AND a.is_active = 1
  `;

  db.get(query, [agentCode], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Invalid agent code' });
    }

    // Return agent info (no password needed)
    res.json({
      success: true,
      agent: {
        agentCode: row.agent_code,
        agentName: row.agent_name,
        teamId: row.team_id,
        teamName: row.team_name,
        role: row.role
      }
    });
  });
});

// Agent Logout
router.post('/logout', (req, res) => {
  const { agentCode } = req.body;
  
  // Here you could update last_logout_time or handle session cleanup
  res.json({ success: true, message: 'Logged out successfully' });
});

// Validate Agent (for middleware)
router.get('/validate/:agentCode', (req, res) => {
  const { agentCode } = req.params;
  
  const db = getSQLiteDB();
  const query = 'SELECT agent_code, agent_name, role FROM agents WHERE agent_code = ? AND is_active = 1';

  db.get(query, [agentCode], (err, row) => {
    if (err || !row) {
      return res.status(401).json({ valid: false });
    }

    res.json({ valid: true, agent: row });
  });
});

module.exports = router;