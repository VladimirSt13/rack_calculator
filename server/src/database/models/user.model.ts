import mongoose, { Document, Types } from 'mongoose';

/**
 * Інтерфейс користувача
 */
export interface IUser {
  email: string;
  passwordHash: string;
  roleId?: Types.ObjectId | null;
  emailVerified: boolean;
  verificationToken?: string | null;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

/**
 * Документ користувача (з Mongoose Document)
 */
export interface IUserDocument extends IUser, Document {}

/**
 * Mongoose схема користувача
 */
const userSchema = new mongoose.Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Не повертати за замовчуванням
      minlength: [6, 'Password must be at least 6 characters'],
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
      select: false,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
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

// Індекси
userSchema.index({ email: 1, deleted: 1 });
userSchema.index({ deleted: 1, createdAt: -1 });
userSchema.index({ roleId: 1, deleted: 1 });

// Віртуальне поле для id
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Методи екземпляра
userSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

userSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

userSchema.methods.isDeleted = function () {
  return this.deleted === true;
};

// Статичні методи
userSchema.statics.cleanupDeleted = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    deleted: true,
    deletedAt: { $lte: cutoffDate },
  });
  return result.deletedCount;
};

userSchema.statics.findByEmail = async function (email: string) {
  return this.findOne({ email, deleted: false });
};

// Метод для отримання безпечної версії користувача (без passwordHash)
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.verificationToken;
  return user;
};

export const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;
