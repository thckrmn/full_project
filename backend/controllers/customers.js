const { PrismaClient } = require("@prisma/client");
const { get } = require("../routes/api");
const prisma = new PrismaClient();

//insert
const createCustomer = async (req, res) => {
  const { customer_id, first_name, last_name, address, email, phone_number } =
    req.body;
  try {
    const cust = await prisma.customers.create({
      data: {
        customer_id,
        first_name,
        last_name,
        address,
        email,
        phone_number,
      },
    });
    res.status(200).json({
      status: "ok",
      message: `User with id ${cust.customer_id} created successfully`,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error creating the user",
      error: err.message,
    });
  }
};

//get all customers
const getAllCustomers = async (req, res) => {
//   try {
    const custs = await prisma.customers.findMany();
    res.json(custs);
};

//get customer by id
const getCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const cust = await prisma.customers.findUnique({
      where: {customer_id: Number(id), },
    });
    if (!cust) {
      return res.status(404).json({ message: 'Customer not found'});                           
    res.json(cust);
    }else{
      res.status(200).json(cust);
    }
  } catch (err) {
    res.status(500).json(err);
}
};

//delete customer
const deleteCustomer = async (req, res) => { 
    const { id } = req.params;
    try {
        const existingCustomer = await prisma.customers.findUnique({
            where: {customer_id: Number(id), 
            },
        });
        if (!existingCustomer) {
            return res.status(404).json({message: 'Customer nor found',});
        }
        await prisma.customers.delete({
            where: {customer_id: Number(id),
            },
        });
        res.status(200).json({
            status: 'success',
            message: `Customer with id ${id} deleted successfully`,
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

    
    //update customer
    const updateCustomer = async (req, res) => {
      const { id } = req.params;
      const { first_name, last_name, address, email, phone_number } = req.body;
      const data  = {};
        if (first_name) data.first_name = first_name;
        if (last_name) data.last_name = last_name;
        if (address) data.address = address;
        if (email) data.email = email;
        if (phone_number) data.phone_number = phone_number;

        if(Object.keys(data).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide the data to update',});
        }

      try {
        const cust = await prisma.customers.update({
          data: data,
          where: {customer_id: Number(id),},
        });
        res.status(200).json({
          status: 'Ok',
          message: `Customer with id = ${id} updated successfully`,
          user: cust,
        });
          
      } catch (error) {
          if (error.code === 'P2002') {
              return res.status(404).json({
                  status: 'error',
                  message: 'Email already exists',
              });
          }else if(error.code === 'P2025'){
              return res.status(404).json({
                  status: 'error',
                  message: 'Phone number already exists',
              });
          }else {
            console.error('Update customer error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error while updating the customer',
                
            })
          }
    };
    };

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomer,
  deleteCustomer,
  updateCustomer,
};