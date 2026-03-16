import mongoose, { Document } from 'mongoose';

/**
 * Інтерфейс конфігурації стелажа
 */
export interface IRackConfiguration {
  name: string;
  type: string;
  rows: number;
  columns: number;
  levels: number;
  braceCount?: number;
  components: Array<{
    type: string;
    quantity: number;
    description?: string;
    price?: number;
  }>;
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

/**
 * Документ конфігурації стелажа (з Mongoose Document)
 */
export interface IRackConfigurationDocument extends IRackConfiguration, Document {}

/**
 * Mongoose схема конфігурації стелажа
 */
const rackConfigurationSchema = new mongoose.Schema<IRackConfigurationDocument>(
  {
    name: {
      type: String,
      required: [true, 'Configuration name is required'],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      trim: true,
      index: true,
    },
    rows: {
      type: Number,
      required: [true, 'Rows is required'],
      min: 1,
    },
    columns: {
      type: Number,
      required: [true, 'Columns is required'],
      min: 1,
    },
    levels: {
      type: Number,
      required: [true, 'Levels is required'],
      min: 1,
    },
    braceCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    components: {
      type: [
        {
          type: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
          description: { type: String, trim: true },
          price: { type: Number, min: 0 },
        },
      ],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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
rackConfigurationSchema.index({ name: 1, type: 1, deleted: 1 });
rackConfigurationSchema.index({ type: 1, deleted: 1 });
rackConfigurationSchema.index({ deleted: 1, createdAt: -1 });

// Віртуальне поле для id
rackConfigurationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Методи екземпляра
rackConfigurationSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

rackConfigurationSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

rackConfigurationSchema.methods.isDeleted = function () {
  return this.deleted === true;
};

// Статичні методи
rackConfigurationSchema.statics.cleanupDeleted = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    deleted: true,
    deletedAt: { $lte: cutoffDate },
  });
  return result.deletedCount;
};

export const RackConfiguration = mongoose.model<IRackConfigurationDocument>(
  'RackConfiguration',
  rackConfigurationSchema,
);

export default RackConfiguration;
