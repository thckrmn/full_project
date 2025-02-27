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
const orderController = require("../controllers/orders");
const userController = require("../controllers/users");
const authController = require("../controllers/auth");

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

router.get("/orders", apiLimit, orderController.getAllOrders);
router.get("/orders/:id", apiLimit, orderController.getOrder);
router.post("/orders", apiLimit, orderController.createOrder);
router.put("/orders/:id", apiLimit, orderController.updateOrder);
router.delete("/orders/:id", apiLimit, orderController.deleteOrder);

router.post("/users", userController.createUser);
router.get("/users/:id", userController.getUser);
router.put("/users/:id", userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.get("/users", userController.getAllUsers);

router.post('/login', authController.login);
router.post('/logout', authController.logout);




module.exports = router;