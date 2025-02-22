const express = require("express");
const rateLimit = require("express-rate-limit");

const apiLimit = rateLimit({
  windowMs: 1000 * 60 * 3, // 3 minutes
  max: 100,
  message: "You have exceeded the 100 requests in 3 minutes limit!",
});

const router = express.Router();
const customerController = require("../controllers/customers");

router.post("/customers", apiLimit, customerController.createCustomer);
router.put("/customers/:id", apiLimit, customerController.updateCustomer);
router.delete("/customers/:id", apiLimit, customerController.deleteCustomer);
router.get("/customers/:id", apiLimit, customerController.getCustomer);
router.get("/customers", apiLimit, customerController.getAllCustomers);

module.exports = router;