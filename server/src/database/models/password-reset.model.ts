import mongoose, { Document, Types } from 'mongoose';

/**
 * Інтерфейс скидання пароля
 */
export interface IPasswordReset {
  userId: Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  used?: boolean;
  usedAt?: Date | null;
  isExpired?: () => boolean;
  isUsed?: () => boolean;
  isValid?: () => boolean;
  markAsUsed?: () => Promise<IPasswordResetDocument>;
}

/**
 * Документ скидання пароля (з Mongoose Document)
 */
export interface IPasswordResetDocument extends IPasswordReset, Document {}

/**
 * Mongoose схема скидання пароля
 */
const passwordResetSchema = new mongoose.Schema<IPasswordResetDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      trim: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
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

// TTL індекс - автоматичне видалення після закінчення терміну дії
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Індекси для запитів
passwordResetSchema.index({ token: 1, used: 1 });
passwordResetSchema.index({ userId: 1, used: 1 });

// Віртуальне поле для id
passwordResetSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Перевірка чи токен дійсний
passwordResetSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

passwordResetSchema.methods.isUsed = function () {
  return this.used === true;
};

passwordResetSchema.methods.isValid = function () {
  return !this.isExpired() && !this.isUsed();
};

// Метод для позначення як використаний
passwordResetSchema.methods.markAsUsed = function () {
  this.used = true;
  this.usedAt = new Date();
  return this.save();
};

// Статичні методи
passwordResetSchema.statics.findByToken = async function (token: string) {
  return this.findOne({ token, used: false });
};

passwordResetSchema.statics.findByUserId = async function (userId: Types.ObjectId) {
  return this.findOne({ userId, used: false }).sort({ createdAt: -1 });
};

passwordResetSchema.statics.deleteExpired = async function () {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { used: true, usedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    ],
  });
  return result.deletedCount;
};

passwordResetSchema.statics.deleteUserTokens = async function (userId: Types.ObjectId) {
  const result = await this.deleteMany({ userId });
  return result.deletedCount;
};

export const PasswordReset = mongoose.model<IPasswordResetDocument>('PasswordReset', passwordResetSchema);

export default PasswordReset;
