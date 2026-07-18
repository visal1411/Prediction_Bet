import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  wallet_address: { type: DataTypes.STRING, unique: true, allowNull: false },
  username: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING }
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

const Event = sequelize.define("Event", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  team_a: { type: DataTypes.STRING, allowNull: false },
  team_b: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING },
  deadline: { type: DataTypes.DATE, allowNull: false },
  contract_event_id: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM("active", "completed", "cancelled"), defaultValue: "active" }
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

const Message = sequelize.define("Message", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  wallet_address: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

const News = sequelize.define("News", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  image: { type: DataTypes.STRING },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

const Transaction = sequelize.define("Transaction", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  wallet_address: { type: DataTypes.STRING, allowNull: false },
  event_id: { type: DataTypes.INTEGER },
  tx_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

// Relationships
Event.hasMany(Message, { foreignKey: "event_id" });
Message.belongsTo(Event, { foreignKey: "event_id" });
User.hasMany(Message, { foreignKey: "wallet_address", sourceKey: "wallet_address" });
Message.belongsTo(User, { foreignKey: "wallet_address", targetKey: "wallet_address" });

export { sequelize, User, Event, Message, News, Transaction };
