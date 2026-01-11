import mongoose from "mongoose";

const commonDescriptionFields = {
  BrandName: { type: String, required: true },
  DaysUsed: { type: Number, required: true },
  Condition: { type: String, enum: ["New", "Used"], required: true },
  color: { type: String, required: true }
};

const categorySpecificFields = {
  Electronics: {
    Warranty: { type: String, enum: ["Yes", "No"], default: "No" },
    material: { type: String, required: true },
    weight: { type: String, required: true },
    dimensions: { type: String, required: true },
    model: { type: String, required: true },
    powerUsage: { type: String },
    batteryLife: { type: String }
  },
  "Mobile Phones": {
    Warranty: { type: String, enum: ["Yes", "No"], default: "No" },
    model: { type: String, required: true },
    storage: { type: String, required: true },
    RAM: { type: String, required: true },
    batteryHealth: { type: String }
  },
  Clothes: {
    material: { type: String, required: true },
    size: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Unisex"], required: true }
  },
  Footwear: {
    material: { type: String, required: true },
    size: { type: String, required: true },
    type: { type: String, required: true }
  },
  Accessories: {
    material: { type: String },
    type: { type: String },
    dimensions: { type: String }
  },
  Books: {
    author: { type: String, required: true },
    genre: { type: String },
    pages: { type: Number },
    publisher: { type: String }
  },
  "Beauty Products": {
    expiryDate: { type: String },
    ingredients: { type: String },
    skinType: { type: String, enum: ["All", "Oily", "Dry", "Combination", "Sensitive"] }
  },
  Sports: {
    type: { type: String, required: true },
    weight: { type: String },
    dimensions: { type: String },
    material: { type: String }
  },
  other: {
    additionalInfo: { type: String }
  }
};

function getDescriptionSchema(category) {
  return new mongoose.Schema(
    {
      ...commonDescriptionFields,
      ...(categorySpecificFields[category] || {})
    },
    { _id: false }
  );
}

let productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: [
      "Electronics", "Mobile Phones", "Clothes", "Footwear", "Accessories", "Books", "Beauty Products", "Sports", "other"
    ],
    default: "Electronics",
    required: true
  },
  image: {
    type: String
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }],
  description: {
    type: mongoose.Schema.Types.Mixed, 
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre("save", function (next) {
  if (this.isModified('likedBy') && Object.keys(this.modifiedPaths()).length === 1) {
    return next();
  }

  const schema = getDescriptionSchema(this.category);
  const modelName = `TempDescription_${this.category.replace(/\s+/g, '_')}`;
  const TempModel = mongoose.models[modelName] || mongoose.model(modelName, schema);
  const descDoc = new TempModel(this.description);
  const error = descDoc.validateSync();
  if (error) return next(error);
  next();
});

export const Product = mongoose.model("Product", productSchema);
export { getDescriptionSchema };