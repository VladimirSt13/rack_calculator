import mongoose, { Document, Types } from 'mongoose';

/**
 * Інтерфейс refresh токена
 */
export interface IRefreshToken {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revoked?: boolean;
  revokedAt?: Date | null;
  replacedByToken?: string | null;
  isExpired?: () => boolean;
  isRevoked?: () => boolean;
  isValid?: () => boolean;
  revoke?: () => Promise<IRefreshTokenDocument>;
}

/**
 * Документ refresh токена (з Mongoose Document)
 */
export interface IRefreshTokenDocument extends IRefreshToken, Document {}

/**
 * Mongoose схема refresh токена
 */
const refreshTokenSchema = new mongoose.Schema<IRefreshTokenDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
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
    revoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedByToken: {
      type: String,
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
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Індекси для запитів
refreshTokenSchema.index({ userId: 1, revoked: 1 });
refreshTokenSchema.index({ token: 1, revoked: 1 });

// Віртуальне поле для id
refreshTokenSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Перевірка чи токен дійсний
refreshTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

refreshTokenSchema.methods.isRevoked = function () {
  return this.revoked === true;
};

refreshTokenSchema.methods.isValid = function () {
  return !this.isExpired() && !this.isRevoked();
};

// Метод для відкликання токена
refreshTokenSchema.methods.revoke = function () {
  this.revoked = true;
  this.revokedAt = new Date();
  return this.save();
};

// Статичні методи
refreshTokenSchema.statics.findByToken = async function (token: string) {
  return this.findOne({ token, revoked: false });
};

refreshTokenSchema.statics.deleteExpired = async function () {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { revoked: true, revokedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    ],
  });
  return result.deletedCount;
};

refreshTokenSchema.statics.deleteUserTokens = async function (userId: Types.ObjectId) {
  const result = await this.deleteMany({ userId });
  return result.deletedCount;
};

export const RefreshToken = mongoose.model<IRefreshTokenDocument>('RefreshToken', refreshTokenSchema);

export default RefreshToken;
