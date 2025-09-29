const { getSQLiteDB, initSQLite, connectMongoDB } = require('../backend-server/config/database');
const { Message, AgentStatus } = require('./mongodb/collections');

async function testDatabases() {
  console.log('🧪 Testing Database Connections...');

  try {
    // Test SQLite
    console.log('\n📊 Testing SQLite...');
    await initSQLite();
    
    const db = getSQLiteDB();
    db.all('SELECT COUNT(*) as count FROM agents', [], (err, rows) => {
      if (err) {
        console.error('❌ SQLite test failed:', err);
      } else {
        console.log(`✅ SQLite working - ${rows[0].count} agents found`);
      }
    });

    // Test MongoDB
    console.log('\n🍃 Testing MongoDB...');
    await connectMongoDB();
    
    const messageCount = await Message.countDocuments();
    const statusCount = await AgentStatus.countDocuments();
    
    console.log(`✅ MongoDB working - ${messageCount} messages, ${statusCount} status records`);
    
    // Test sample queries
    console.log('\n🔍 Sample Query Tests:');
    
    // Get active agents
    db.all(`
      SELECT agent_code, agent_name, role 
      FROM agents 
      WHERE is_active = 1 
      LIMIT 3
    `, [], (err, agents) => {
      if (!err) {
        console.log('📝 Sample agents:', agents);
      }
    });

    // Get recent messages
    const recentMessages = await Message.find().sort({ timestamp: -1 }).limit(3);
    console.log('💬 Recent messages:', recentMessages.length);

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

if (require.main === module) {
  testDatabases();
}

module.exports = { testDatabases };