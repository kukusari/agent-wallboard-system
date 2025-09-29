const { getSQLiteDB } = require('../config/database');

class Agent {
  static async findByCode(agentCode) {
    return new Promise((resolve, reject) => {
      const db = getSQLiteDB();
      const query = `
        SELECT a.*, t.team_name 
        FROM agents a 
        LEFT JOIN teams t ON a.team_id = t.team_id 
        WHERE a.agent_code = ? AND a.is_active = 1
      `;
      
      db.get(query, [agentCode], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByTeam(teamId) {
    return new Promise((resolve, reject) => {
      const db = getSQLiteDB();
      const query = `
        SELECT agent_code, agent_name, role 
        FROM agents 
        WHERE team_id = ? AND is_active = 1 
        ORDER BY agent_name
      `;
      
      db.all(query, [teamId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getAllActive() {
    return new Promise((resolve, reject) => {
      const db = getSQLiteDB();
      const query = `
        SELECT a.agent_code, a.agent_name, a.team_id, t.team_name, a.role
        FROM agents a
        LEFT JOIN teams t ON a.team_id = t.team_id
        WHERE a.is_active = 1
        ORDER BY a.agent_name
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async createSession(agentCode, ipAddress, userAgent) {
    return new Promise((resolve, reject) => {
      const db = getSQLiteDB();
      const query = `
        INSERT INTO agent_sessions (agent_code, ip_address, user_agent)
        VALUES (?, ?, ?)
      `;
      
      db.run(query, [agentCode, ipAddress, userAgent], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  static async endSession(sessionId) {
    return new Promise((resolve, reject) => {
      const db = getSQLiteDB();
      const query = `
        UPDATE agent_sessions 
        SET logout_time = CURRENT_TIMESTAMP, is_active = 0 
        WHERE session_id = ?
      `;
      
      db.run(query, [sessionId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
}

module.exports = Agent;