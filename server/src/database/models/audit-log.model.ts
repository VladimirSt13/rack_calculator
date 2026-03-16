import mongoose, { Document, Types } from 'mongoose';

/**
 * Інтерфейс запису аудиту
 */
export interface IAuditLog {
  userId: Types.ObjectId | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * Документ запису аудиту (з Mongoose Document)
 */
export interface IAuditLogDocument extends IAuditLog, Document {}

/**
 * Mongoose схема запису аудиту
 */
const auditLogSchema = new mongoose.Schema<IAuditLogDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export'],
      index: true,
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      index: true,
    },
    entityId: {
      type: String,
      required: [true, 'Entity ID is required'],
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Індекси для оптимізації запитів
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// Віртуальне поле для id
auditLogSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Статичні методи
auditLogSchema.statics.cleanupOld = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
  });
  return result.deletedCount;
};

auditLogSchema.statics.getStats = async function () {
  const totalLogs = await this.countDocuments();

  const logsByAction = await this.aggregate([
    { $group: { _id: '$action', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const logsByEntityType = await this.aggregate([
    { $group: { _id: '$entityType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const topUsers = await this.aggregate([
    { $match: { userId: { $ne: null } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: { $toString: '$_id' },
        email: '$user.email',
        count: 1,
      },
    },
  ]);

  return {
    totalLogs,
    logsByAction: logsByAction.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    logsByEntityType: logsByEntityType.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    topUsers,
  };
};

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);

export default AuditLog;
