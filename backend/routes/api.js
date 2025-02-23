const express = require("express");
const rateLimit = require("express-rate-limit");

const apiLimit = rateLimit({
  windowMs: 1000 * 60 * 3, // 3 minutes
  max: 100,
  message: "You have exceeded the 100 requests in 3 minutes limit!",
});

const router = express.Router();
const customerController = require("../controllers/customers");
const productController = require("../controllers/products");

router.post("/customers", apiLimit, customerController.createCustomer);
router.put("/customers/:id", apiLimit, customerController.updateCustomer);
router.delete("/customers/:id", apiLimit, customerController.deleteCustomer);
router.get("/customers/:id", apiLimit, customerController.getCustomer);
router.get("/customers", apiLimit, customerController.getAllCustomers);

router.post("/products", apiLimit, productController.createProduct);
router.put("/products/:id", apiLimit, productController.updateProduct);
router.delete("/products/:id", apiLimit, productController.deleteProduct);
router.get("/products/:id", apiLimit, productController.getProduct);
router.get("/products", apiLimit, productController.getAllProducts);

module.exports = router;