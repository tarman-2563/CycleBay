import path from "path";
import {
  getAllProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  getProductsByUserIdService
} from "../services/product.service.js";

import { Product } from "../db/models/productSchema.js";

const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      page = 1,
      limit = 100,
    } = req.query;

    // Add cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'ETag': `products-${Date.now()}` // Simple ETag
    });

    const filters = { search, category, minPrice, maxPrice };

    const products = await getAllProductsService(
      filters,
      sortBy || "createdAt",
      Number(sortOrder) || -1,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({ 
      success: true,
      data: products,
      count: products.length,
      page: Number(page),
      limit: Number(limit)
    }); 
  } catch (err) {
    console.error("getAllProducts error:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error",
      message: err.message 
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email'); 

    if (!product){ 
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, data: product });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Image file is required" 
      });
    }

    const imageFileName = req.file.filename;
    let description;
    
    try {
      description = JSON.parse(req.body.description);
    } catch (err) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid description format" 
      });
    }

    const productData = {
      ...req.body,
      image: imageFileName,
      description
    };

    const product = await createProductService(productData, req.user.userId);
    res.status(201).json({ 
      success: true, 
      message: "Product created successfully",
      data: product 
    });
  } catch (error) {
    console.error("create product error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server Error" 
    });
  }
};


let updateProduct = async (req, res) => {
  try {
    const updatedProduct = await updateProductService(req.params.id, req.user.userId, req.body);
    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (err) {
    if (err.message === "Forbidden") {
      return res.status(403).json({ success: false, message: "You do not own this product" });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: "Invalid description fields in update", errors: err.errors });
    }
    console.error("update product error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

let deleteProduct = async (req, res) => {
  try {
    const result = await deleteProductService(req.params.id, req.user.userId);
    if (!result) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    if (err.message === "Forbidden") {
      return res.status(403).json({ success: false, message: "You do not own this product" });
    }
    console.error("delete error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const likeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

   
    if (product.likedBy.includes(req.user.userId)) {
      return res.status(400).json({ success: false, message: "You have already liked this product" });
    }


    product.likedBy.push(req.user.userId);
    await product.save();

    return res.status(200).json({ 
      success: true, 
      message: "Product liked successfully",
      data: product 
    });
  } catch (err) {
    console.error("like product error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const unlikeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    
    if (!product.likedBy.includes(req.user.userId)) {
      return res.status(400).json({ success: false, message: "You have not liked this product yet" });
    }

    
    product.likedBy = product.likedBy.filter(id => id.toString() !== req.user.userId);
    await product.save();

    return res.status(200).json({ 
      success: true, 
      message: "Product unliked successfully",
      data: product 
    });
  } catch (err) {
    console.error("unlike product error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getProductsByUserId = async (req, res) => {
  try {
    console.log("Fetching products for user:", req.params.userId);
    console.log("User from token:", req.user); 
    
    if (!req.params.userId) {
      console.log("No userId provided in params");
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    if (!req.user || !req.user.userId) {
      console.log("No user found in request");
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const products = await getProductsByUserIdService(req.params.userId);
    console.log("Found products:", products.length);
    
    return res.status(200).json({
      success: true,
      message: "User products fetched successfully",
      data: products
    });
  } catch (err) {
    console.error("get user products error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: err.message 
    });
  }
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  likeProduct,
  unlikeProduct,
  getProductsByUserId
};
