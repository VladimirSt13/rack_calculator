import mongoose, { Document, Types } from 'mongoose';

/**
 * Інтерфейс комплекту стелажів
 */
export interface IRackSet {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  currentRevision: number;
  deleted?: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Документ комплекту стелажів (з Mongoose Document)
 */
export interface IRackSetDocument extends IRackSet, Document {}

/**
 * Mongoose схема комплекту стелажів
 */
const rackSetSchema = new mongoose.Schema<IRackSetDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    currentRevision: {
      type: Number,
      default: 1,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Індекси
rackSetSchema.index({ userId: 1, deleted: 1, createdAt: -1 });
rackSetSchema.index({ deleted: 1, createdAt: -1 });
rackSetSchema.index({ name: 1, deleted: 1 });

// Віртуальне поле для id
rackSetSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Методи екземпляра
rackSetSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

rackSetSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

rackSetSchema.methods.isDeleted = function () {
  return this.deleted === true;
};

rackSetSchema.methods.incrementRevision = function () {
  this.currentRevision += 1;
  return this.save();
};

// Статичні методи
rackSetSchema.statics.cleanupDeleted = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    deleted: true,
    deletedAt: { $lte: cutoffDate },
  });
  return result.deletedCount;
};

export const RackSet = mongoose.model<IRackSetDocument>('RackSet', rackSetSchema);

export default RackSet;
