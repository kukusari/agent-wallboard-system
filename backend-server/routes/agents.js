const express = require('express');
const { getSQLiteDB } = require('../config/database');
const Message = require('../models/Message');
const router = express.Router();

// Get all agents (for supervisor dashboard)
router.get('/', (req, res) => {
  const db = getSQLiteDB();
  const query = `
    SELECT a.agent_code, a.agent_name, a.team_id, t.team_name, a.role
    FROM agents a
    LEFT JOIN teams t ON a.team_id = t.team_id
    WHERE a.is_active = 1
    ORDER BY a.agent_name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ agents: rows });
  });
});

// Get agents by team (for team-specific views)
router.get('/team/:teamId', (req, res) => {
  const { teamId } = req.params;
  const db = getSQLiteDB();
  
  const query = `
    SELECT agent_code, agent_name, role
    FROM agents 
    WHERE team_id = ? AND is_active = 1
    ORDER BY agent_name
  `;

  db.all(query, [teamId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ agents: rows });
  });
});

// Get agent details
router.get('/:agentCode', (req, res) => {
  const { agentCode } = req.params;
  const db = getSQLiteDB();
  
  const query = `
    SELECT a.*, t.team_name 
    FROM agents a 
    LEFT JOIN teams t ON a.team_id = t.team_id 
    WHERE a.agent_code = ?
  `;

  db.get(query, [agentCode], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ agent: row });
  });
});

module.exports = router;