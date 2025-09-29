const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  fromCode: {
    type: String,
    required: true,
    index: true
  },
  toCode: {
    type: String,
    index: true,
    default: null
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['direct', 'broadcast'],
    default: 'direct'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  collection: 'messages',
  timestamps: true
});

// Compound indexes
messageSchema.index({ toCode: 1, timestamp: -1 });
messageSchema.index({ fromCode: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;