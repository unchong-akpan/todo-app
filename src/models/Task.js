const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255
    },
    description: {
      type: String,
      maxlength: 1000,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'deleted'],
      default: 'pending'
    },
    category: {
      type: String,
      enum: ['Work', 'Personal', 'Urgent', 'Health', 'Other'],
      default: 'Other'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);
