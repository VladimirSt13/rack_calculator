import mongoose, { Document, Types } from 'mongoose';

/**
 * Інтерфейс розрахунку
 */
export interface ICalculation {
  userId: Types.ObjectId;
  name: string;
  type: 'rack' | 'battery';
  data: any;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

/**
 * Документ розрахунку (з Mongoose Document)
 */
export interface ICalculationDocument extends ICalculation, Document {}

/**
 * Mongoose схема розрахунку
 */
const calculationSchema = new mongoose.Schema<ICalculationDocument>(
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
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['rack', 'battery'],
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Calculation data is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
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
calculationSchema.index({ userId: 1, type: 1, deleted: 1, createdAt: -1 });
calculationSchema.index({ deleted: 1, createdAt: -1 });

// Віртуальне поле для id
calculationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Методи екземпляра
calculationSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

calculationSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

calculationSchema.methods.isDeleted = function () {
  return this.deleted === true;
};

// Статичні методи
calculationSchema.statics.cleanupDeleted = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    deleted: true,
    deletedAt: { $lte: cutoffDate },
  });
  return result.deletedCount;
};

export const Calculation = mongoose.model<ICalculationDocument>(
  'Calculation',
  calculationSchema,
);

export default Calculation;
