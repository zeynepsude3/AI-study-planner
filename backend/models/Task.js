const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Task = sequelize.define('Task', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:         { type: DataTypes.UUID, allowNull: false },
  courseId:       { type: DataTypes.UUID, allowNull: true },
  title:          { type: DataTypes.STRING, allowNull: false },
  description:    { type: DataTypes.TEXT },
  status:         { type: DataTypes.ENUM('pending', 'in_progress', 'done', 'skipped'), defaultValue: 'pending' },
  priority:       { type: DataTypes.INTEGER, defaultValue: 1, validate: { min: 1, max: 5 } },
  dueDate:        { type: DataTypes.DATEONLY },
  estimatedHours: { type: DataTypes.FLOAT, defaultValue: 1 }
}, { tableName: 'tasks', timestamps: true });

module.exports = Task;
