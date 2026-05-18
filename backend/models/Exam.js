const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Exam = sequelize.define('Exam', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:   { type: DataTypes.UUID, allowNull: false },
  courseId: { type: DataTypes.UUID, allowNull: true },
  title:    { type: DataTypes.STRING, allowNull: false },
  examDate: { type: DataTypes.DATEONLY, allowNull: false },
  duration: { type: DataTypes.INTEGER, defaultValue: 90 },
  location: { type: DataTypes.STRING },
  notes:    { type: DataTypes.TEXT }
}, { tableName: 'exams', timestamps: true });

module.exports = Exam;
