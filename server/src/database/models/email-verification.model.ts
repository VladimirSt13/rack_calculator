import mongoose, { Document, Types } from 'mongoose';

/**
 * Інтерфейс підтвердження email
 */
export interface IEmailVerification {
  userId: Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  verified?: boolean;
  verifiedAt?: Date | null;
  isExpired?: () => boolean;
  isVerified?: () => boolean;
  isValid?: () => boolean;
  verify?: () => Promise<IEmailVerificationDocument>;
}

/**
 * Документ підтвердження email (з Mongoose Document)
 */
export interface IEmailVerificationDocument extends IEmailVerification, Document {}

/**
 * Mongoose схема підтвердження email
 */
const emailVerificationSchema = new mongoose.Schema<IEmailVerificationDocument>(
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
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
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
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Індекси для запитів
emailVerificationSchema.index({ token: 1, verified: 1 });
emailVerificationSchema.index({ userId: 1, verified: 1 });

// Віртуальне поле для id
emailVerificationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Перевірка чи токен дійсний
emailVerificationSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

emailVerificationSchema.methods.isVerified = function () {
  return this.verified === true;
};

emailVerificationSchema.methods.isValid = function () {
  return !this.isExpired() && !this.isVerified();
};

// Метод для підтвердження
emailVerificationSchema.methods.verify = function () {
  this.verified = true;
  this.verifiedAt = new Date();
  return this.save();
};

// Статичні методи
emailVerificationSchema.statics.findByToken = async function (token: string) {
  return this.findOne({ token, verified: false });
};

emailVerificationSchema.statics.findByUserId = async function (userId: Types.ObjectId) {
  return this.findOne({ userId, verified: false }).sort({ createdAt: -1 });
};

emailVerificationSchema.statics.deleteExpired = async function () {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { verified: true, verifiedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    ],
  });
  return result.deletedCount;
};

export const EmailVerification = mongoose.model<IEmailVerificationDocument>(
  'EmailVerification',
  emailVerificationSchema,
);

export default EmailVerification;
