import mongoose, { Document } from 'mongoose';

/**
 * Інтерфейс компонента прайсу
 */
export interface IPriceComponent {
  name: string;
  category: string;
  price: number;
  unit?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

/**
 * Документ компонента прайсу (з Mongoose Document)
 */
export interface IPriceComponentDocument extends IPriceComponent, Document {}

/**
 * Mongoose схема компонента прайсу
 */
const priceComponentSchema = new mongoose.Schema<IPriceComponentDocument>(
  {
    name: {
      type: String,
      required: [true, 'Component name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    unit: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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

// Комбінований індекс для унікальності
priceComponentSchema.index({ name: 1, category: 1, deleted: 1 });

// Віртуальне поле для id
priceComponentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Методи екземпляра
priceComponentSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

priceComponentSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

priceComponentSchema.methods.isDeleted = function () {
  return this.deleted === true;
};

// Статичні методи
priceComponentSchema.statics.cleanupDeleted = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    deleted: true,
    deletedAt: { $lte: cutoffDate },
  });
  return result.deletedCount;
};

export const PriceComponent = mongoose.model<IPriceComponentDocument>('PriceComponent', priceComponentSchema);

export default PriceComponent;
