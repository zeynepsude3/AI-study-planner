const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Course = sequelize.define('Course', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:     { type: DataTypes.UUID, allowNull: false },
  name:       { type: DataTypes.STRING, allowNull: false },
  credits:    { type: DataTypes.INTEGER, defaultValue: 3 },
  difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard'), defaultValue: 'medium' },
  color:      { type: DataTypes.STRING, defaultValue: '#4f46e5' }
}, { tableName: 'courses', timestamps: true });

module.exports = Course;
