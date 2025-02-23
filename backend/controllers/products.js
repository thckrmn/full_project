const { PrismaClient } = require("@prisma/client");
const { get } = require("../routes/api");
const prisma = new PrismaClient();

//insert
const createProduct = async (req, res) => {
  const { product_id, name, description, price, category, image_url } =
    req.body;
  try {
    const product = await prisma.products.create({
      data: {
        product_id,
        name,
        description,
        price,
        category,
        image_url,
      },
    });
    res.status(200).json({
      status: "success",
      message: `User with id ${product.product_id} created successfully`,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error creating the user",
      error: err.message,
    });
  }
};

//get all products
const getAllProducts = async (req, res) => {
//   try {
    const product = await prisma.products.findMany();
    res.json(product);
};

//get product by id
const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.products.findUnique({
      where: {product_id: Number(id), },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found'});                           
    res.json(product);
    }else{
      res.status(200).json(product);
    }
  } catch (err) {
    res.status(500).json(err);
}
};

//delete product
const deleteProduct = async (req, res) => { 
    const { id } = req.params;
    try {
        const existingProduct = await prisma.products.findUnique({
            where: {product_id: Number(id), 
            },
        });
        if (!existingProduct) {
            return res.status(404).json({message: 'Product nor found',});
        }
        await prisma.products.delete({
            where: {product_id: Number(id),
            },
        });
        res.status(200).json({
            status: 'success',
            message: `Product with id ${id} deleted successfully`,
        })

    } catch (error) {
      console.error('Delete custoomer error:', error);
      res.status(500).json({
          status: 'error',
          message: 'Error deleting the customer',
          error: error.message,
      });

    }
    };

//update product
    const updateProduct = async (req, res) => {
      const { id } = req.params;
      const { product_id,name, description, price, category, image_url } = req.body;
      const data  = {};
        if(product_id) data.product_id = product_id;
        if(name) data.name = name;
        if(description) data.description = description;
        if(price) data.price = price;
        if(category) data.category = category;
        if(image_url) data.image_url = image_url;

        if(Object.keys(data).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide the data to update',});
        }

      try {
        const product = await prisma.products.update({
          data: data,
          where: {product_id: Number(id),},
        });
        res.status(200).json({
          status: 'Ok',
          message: `Product with id = ${id} updated successfully`,
          user: product,
        });
          
      } catch (error) {
          
            console.error('Update product error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error while updating the product',
                
            })
          }
    };
module.exports = {
    createProduct,getAllProducts,getProduct,updateProduct,deleteProduct
  };