import mongoose, { Document, Types } from 'mongoose';

/**
 * Інтерфейс ревізії комплекту стелажів
 */
export interface IRackSetRevision {
  rackSetId: Types.ObjectId;
  revisionNumber: number;
  racks: any[];
  createdBy: Types.ObjectId;
  createdAt: Date;
}

/**
 * Документ ревізії комплекту стелажів (з Mongoose Document)
 */
export interface IRackSetRevisionDocument extends IRackSetRevision, Document {}

/**
 * Mongoose схема ревізії комплекту стелажів
 */
const rackSetRevisionSchema = new mongoose.Schema<IRackSetRevisionDocument>(
  {
    rackSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RackSet',
      required: [true, 'RackSet ID is required'],
      index: true,
    },
    revisionNumber: {
      type: Number,
      required: [true, 'Revision number is required'],
      min: 1,
    },
    racks: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Racks data is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Індекси
rackSetRevisionSchema.index({ rackSetId: 1, revisionNumber: -1 });
rackSetRevisionSchema.index({ createdBy: 1, createdAt: -1 });

// Віртуальне поле для id
rackSetRevisionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Статичні методи
rackSetRevisionSchema.statics.getLatestRevision = async function (rackSetId: Types.ObjectId) {
  return this.findOne({ rackSetId }).sort({ revisionNumber: -1 }).exec();
};

rackSetRevisionSchema.statics.getRevisions = async function (rackSetId: Types.ObjectId) {
  return this.find({ rackSetId }).sort({ revisionNumber: -1 }).exec();
};

export const RackSetRevision = mongoose.model<IRackSetRevisionDocument>(
  'RackSetRevision',
  rackSetRevisionSchema,
);

export default RackSetRevision;
