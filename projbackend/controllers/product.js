const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const e = require("express");
const { sortBy } = require("lodash");
const { update } = require("../models/product");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found"
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image"
      });
    }

    //TODO: restrictions on field
    let product = new Product(fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!"
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // console.log(product);
    //save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "Saving tshirt in DB failed"
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined
  return res.json(req.product)
}

exports.photo = (req, res, next) =>{
  if(req.product.photo.data){
    res.set("Content-Type", req.product.photo.contentType)
    return res.send(req.product.photo.data)
  }
  next();
};

//delete controllers
exports.deleteProduct = (req, res) =>{
  let product = req.product;
  product.remove((err, deletedProduct) =>{
    if(err){
      return res.status(400).json({
        error: "Failed to delete the product"
      })
    }
    res.json({
      message: "Deletion was a success",
      deletedProduct
    });
  });
};

exports.updateProduct = (req, res) =>{
  
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image"
      });
    }

    
    //updation code
    let product = req.product;
    product = _.extend(product, fields)

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!"
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // console.log(product);
    //save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "Updation failed"
        });
      }
      res.json(product);
    });
  });
}; 

//Products listing

exports.getAllProducts = (req, res) =>{
  let limit = req.query.limit ? parseInt(req.query.limit) : 8
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id"
  

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(8)
    .exec((err, products) =>{
      if(err){
        return res.status(400).json({
          error: "No product found"
        });
      };
      res.json(products)
    });
};


exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) =>{
    if(err){
      return res.status(400).json({
        error: "No category found"
      });
    }
    res.json(category);
  });
};

exports.updateStock = (req, res, next) =>{
  let myOperations = req.body.order.product.map(prod =>{
    return{
      updateOne: {
        filter: {_id: prod._id},
        update: {$inc: {stock: -prod.count, sold: +prod.count} }
      }
    };
  });
  Product.bulkWrite(myOperations, {}, (err, products) =>{
    if(err){
      return res.status(400).json({
        error: "Bulk operation failed"
      })
    }
    next();
  })
};