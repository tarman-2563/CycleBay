import { Product, getDescriptionSchema } from "../db/models/productSchema.js";
import mongoose from "mongoose";

const getAllProductsService = async (
  filters = {},
  sortBy = "createdAt",
  sortOrder = 1,
  page = 1,
  limit = 100
) => {
  let query = {};

  // Improved search using MongoDB text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  let sort = {};
  
  // If text search is used, sort by text score first
  if (filters.search) {
    sort.score = { $meta: "textScore" };
  }
  
  sort[sortBy] = sortOrder;

  const products = await Product.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(); // Use lean() for better performance

  return products;
};

const getProductByIdService = async (id) => {
  return await Product.findById(id);
};

const createProductService = async (data, userId) => {
  const { name, desc, price, category, image, description } = data;

  if (!category || typeof category !== 'string') {
    throw new Error("Category is required and must be a string");
  }

  const schema = getDescriptionSchema(category);
  const modelName = `TempDescription_${category.replace(/\s+/g, '_')}`;
  const TempModel = mongoose.models[modelName] || mongoose.model(modelName, schema);
  const descDoc = new TempModel(description);
  const validationError = descDoc.validateSync();
  if (validationError) throw validationError;
  const newProduct = new Product({ name, desc, price, category, image, description, createdBy: userId });
  return await newProduct.save();
};


const updateProductService = async (id, userId, updateData) => {
  const product = await Product.findById(id);
  if (!product) return null;
  if (product.createdBy.toString() !== userId) throw new Error("Forbidden");
  if (updateData.description) {
    const schema = getDescriptionSchema(updateData.category);
    const modelName = `TempDescription_${updateData.category.replace(/\s+/g, '_')}`;
    const TempModel = mongoose.models[modelName] || mongoose.model(modelName, schema);
    const descDoc = new TempModel(updateData.description);
    const validationError = descDoc.validateSync();
    if (validationError) throw validationError;
  }
  Object.assign(product, updateData);
  return await product.save();
};

const deleteProductService = async (id, userId) => {
  const product = await Product.findById(id);
  if (!product) return null;
  if (product.createdBy.toString() !== userId) throw new Error("Forbidden");
  await Product.findByIdAndDelete(id);
  return true;
};

const getProductsByUserIdService = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const products = await Product.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
      
    return products;
  } catch (err) {
    console.error("getProductsByUserIdService error:", err);
    throw err;
  }
};

export {
  getAllProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  getProductsByUserIdService
};