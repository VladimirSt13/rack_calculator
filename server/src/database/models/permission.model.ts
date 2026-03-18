import mongoose, { Document } from 'mongoose';

/**
 * Інтерфейс дозволу
 */
export interface IPermission {
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

/**
 * Документ дозволу (з Mongoose Document)
 */
export interface IPermissionDocument extends IPermission, Document {}

/**
 * Mongoose схема дозволу
 */
const permissionSchema = new mongoose.Schema<IPermissionDocument>(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [100, 'Permission name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    resource: {
      type: String,
      required: [true, 'Resource is required'],
      trim: true,
      lowercase: true,
      index: true,
      maxlength: [50, 'Resource cannot exceed 50 characters'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      lowercase: true,
      index: true,
      enum: ['create', 'read', 'update', 'delete', 'all'],
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
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Комбінований індекс
permissionSchema.index({ resource: 1, action: 1, deleted: 1 });
permissionSchema.index({ deleted: 1 });

// Віртуальне поле для id
permissionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Методи екземпляра
permissionSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

permissionSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

permissionSchema.methods.isDeleted = function () {
  return this.deleted === true;
};

// Статичні методи
permissionSchema.statics.cleanupDeleted = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    deleted: true,
    deletedAt: { $lte: cutoffDate },
  });
  return result.deletedCount;
};

permissionSchema.statics.findByResource = async function (resource: string) {
  return this.find({ resource: resource.toLowerCase(), deleted: false });
};

permissionSchema.statics.findByName = async function (name: string) {
  return this.findOne({ name: name.toUpperCase(), deleted: false });
};

// Перевірка чи існує дозвіл
permissionSchema.statics.existsByResourceAndAction = async function (resource: string, action: string) {
  const permission = await this.findOne({
    resource: resource.toLowerCase(),
    action: action.toLowerCase(),
    deleted: false,
  });
  return permission !== null;
};

export const Permission = mongoose.model<IPermissionDocument>('Permission', permissionSchema);

export default Permission;
