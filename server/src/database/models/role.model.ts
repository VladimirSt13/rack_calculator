import mongoose, { Document, Types } from 'mongoose';

/**
 * Інтерфейс ролі
 */
export interface IRole {
  name: string;
  description?: string;
  permissions?: Types.ObjectId[];
  createdAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

/**
 * Документ ролі (з Mongoose Document)
 */
export interface IRoleDocument extends IRole, Document {}

/**
 * Mongoose схема ролі
 */
const roleSchema = new mongoose.Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [50, 'Role name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
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

// Індекси
roleSchema.index({ name: 1, deleted: 1 });

// Віртуальне поле для id
roleSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Методи екземпляра
roleSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

roleSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

roleSchema.methods.isDeleted = function () {
  return this.deleted === true;
};

// Статичні методи
roleSchema.statics.cleanupDeleted = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    deleted: true,
    deletedAt: { $lte: cutoffDate },
  });
  return result.deletedCount;
};

roleSchema.statics.findByName = async function (name: string) {
  return this.findOne({ name: name.toUpperCase(), deleted: false });
};

// Метод для додавання дозволу
roleSchema.methods.addPermission = async function (permissionId: Types.ObjectId) {
  if (!this.permissions?.includes(permissionId)) {
    this.permissions = this.permissions || [];
    this.permissions.push(permissionId);
    return this.save();
  }
  return this;
};

// Метод для видалення дозволу
roleSchema.methods.removePermission = async function (permissionId: Types.ObjectId) {
  if (this.permissions) {
    this.permissions = this.permissions.filter((id: Types.ObjectId) => !id.equals(permissionId));
    return this.save();
  }
  return this;
};

export const Role = mongoose.model<IRoleDocument>('Role', roleSchema);

export default Role;
