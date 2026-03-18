import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rack_calculator';

const clearPrices = async () => {
  try {
    console.log('[Clear Prices] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Clear Prices] Connected successfully');

    const Price = mongoose.model('Price', new mongoose.Schema({}, { strict: false }));
    
    const count = await Price.countDocuments({});
    console.log(`[Clear Prices] Found ${count} documents`);
    
    await Price.deleteMany({});
    console.log('[Clear Prices] All prices deleted');
    
    await mongoose.disconnect();
    console.log('[Clear Prices] Done');
    process.exit(0);
  } catch (error) {
    console.error('[Clear Prices] Error:', error);
    process.exit(1);
  }
};

clearPrices();
