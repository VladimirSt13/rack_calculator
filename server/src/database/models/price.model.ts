import mongoose, { Document } from 'mongoose';

/**
 * Інтерфейс прайсу
 */
export interface IPrice {
  data: any;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

/**
 * Документ прайсу (з Mongoose Document)
 */
export interface IPriceDocument extends IPrice, Document {}

/**
 * Mongoose схема прайсу
 */
const priceSchema = new mongoose.Schema<IPriceDocument>(
  {
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Price data is required'],
    },
    category: {
      type: String,
      trim: true,
      default: 'default',
      index: true,
    },
    deleted: {
      type: Boolean,
      default: false,
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
priceSchema.index({ category: 1, updatedAt: -1 });
priceSchema.index({ deleted: 1, updatedAt: -1 });

// Віртуальне поле для id
priceSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Методи екземпляра
priceSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

priceSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

priceSchema.methods.isDeleted = function () {
  return this.deleted === true;
};

// Статичні методи
priceSchema.statics.cleanupDeleted = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    deleted: true,
    deletedAt: { $lte: cutoffDate },
  });
  return result.deletedCount;
};

export const Price = mongoose.model<IPriceDocument>('Price', priceSchema);

export default Price;
