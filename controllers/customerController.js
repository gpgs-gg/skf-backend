import Customer from "../models/Customer.js";

// CREATE CUSTOMER
export const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL ACTIVE CUSTOMERS
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE ACTIVE CUSTOMER
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE CUSTOMER
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DEACTIVATE CUSTOMER (SOFT DELETE)
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CHECK CUSTOMER BY MOBILE
export const checkCustomerByMobile = async (req, res) => {
  try {
    const { mobile } = req.params;

    const customer = await Customer.findOne({
      mobile,
      isActive: true,
    });

    if (customer) {
      return res.status(200).json({
        success: true,
        exists: true,
        data: customer,
      });
    }

    return res.status(200).json({
      success: true,
      exists: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// import Customer from "../models/Customer.js";

// // CREATE CUSTOMER
// export const createCustomer = async (req, res) => {
//   try {
//     const customer = await Customer.create(req.body);

//     res.status(201).json({
//       success: true,
//       message: "Customer created successfully",
//       data: customer,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // GET ALL CUSTOMERS
// export const getCustomers = async (req, res) => {
//   try {
//     const customers = await Customer.find().sort({
//       createdAt: -1,
//     });

//     res.status(200).json({
//       success: true,
//       count: customers.length,
//       data: customers,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // GET SINGLE CUSTOMER
// export const getCustomerById = async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.params.id);

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: customer,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // UPDATE CUSTOMER
// export const updateCustomer = async (req, res) => {
//   try {
//     const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Customer updated successfully",
//       data: customer,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // DELETE CUSTOMER
// export const deleteCustomer = async (req, res) => {
//   try {
//     const customer = await Customer.findByIdAndDelete(req.params.id);

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Customer deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // CHECK CUSTOMER BY MOBILE
// export const checkCustomerByMobile = async (req, res) => {
//   try {
//     const { mobile } = req.params;

//     const customer = await Customer.findOne({ mobile });

//     if (customer) {
//       return res.status(200).json({
//         success: true,
//         exists: true,
//         data: customer,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       exists: false,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
