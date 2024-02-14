import express from 'express';
import { initializeDatabase } from './database';
import { CustomerRepository} from './repositories/customerRepo';
import { OrderRepo } from './repositories/orderRepository'; 
import { supplierRepository } from './repositories/supplierRepo';
import { ProductRepo } from './repositories/productRepo'; 
import { OrderItemRepo } from './repositories/orderitemRepo'; 
import { Request, Response, NextFunction } from 'express';

require('dotenv').config()
const jwt = require('jsonwebtoken')
const app = express();
const port = 5000;

const crypto = require('crypto');
const ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
console.log('Encryption Key:', ENCRYPTION_KEY);

const IV_LENGTH = 16;

function encryptData(data: { message?: string; FirstName?: any; LastName?: any; City?: any; Country?: any; Phone?: any; }) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptData(encryptedData: string): any {
  const parts = encryptedData.split(':');
  const ivHex = parts.shift();
  if (!ivHex) {
    throw new Error('Invalid encrypted data format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
}

initializeDatabase().then(async () => {
  console.log('Database connected.');

  const CustomerRepo= new CustomerRepository();
  app.use(express.json());

  const SupplierRepo= new supplierRepository();
  app.use(express.json());

  const orderRepo= new OrderRepo();
  app.use(express.json());

  const productRepo= new ProductRepo();
  app.use(express.json());

  const orderItemRepo = new OrderItemRepo();
  app.use(express.json()); 
  
  const JWT_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET || 'default_secret_key';

  interface CustomRequest extends Request {
    user?: any;
  }
  
  const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET_KEY, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };
  
app.post('/login', async (req, res) => {
    const { FirstName, LastName, City, Country, Phone } = req.body;
    const existingCustomer = await CustomerRepo.getCustomerByPhone(Phone);
  
    if (existingCustomer) {
      const user = { FirstName, LastName, City, Country, Phone };
      const accessToken = jwt.sign(user, JWT_SECRET_KEY);
      res.json({ accessToken: accessToken });
    } else {
      res.status(404).json({ error: 'You are a new user. Create an account.' });
    }
});
 
app.get('/protected', authenticateToken, (req: CustomRequest, res: Response) => {
  const { FirstName, LastName, City, Country, Phone } = req.user;
  const user = { FirstName, LastName, City, Country, Phone };
  res.json({ user: user });
});

app.post('/customers', async (req, res) => {
  const { FirstName, LastName, City, Country, Phone } = req.body;
  try {
    const encryptedCustomerData = encryptData({ FirstName, LastName, City, Country, Phone });
    const { FirstName: decryptedFirstName, LastName: decryptedLastName, City: decryptedCity, Country: decryptedCountry, Phone: decryptedPhone } = decryptData(encryptedCustomerData);
    const customer = await CustomerRepo.createcustomer(decryptedFirstName, decryptedLastName, decryptedCity, decryptedCountry, decryptedPhone);
    res.json({ message: 'Customer created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create.' });
  }
});

app.get('/customers',authenticateToken, async (req, res) => {
  try {
      const customers = await CustomerRepo.getAllCustomers();
      res.json(customers);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve.' });
  }
});

app.get('/customers/:id',authenticateToken, async (req, res) => {
  const customerId = parseInt(req.params.id, 10); 

  try {
    const customer = await CustomerRepo.getCustomerById(customerId); 
    if (customer) {
      res.json(customer); 
    } else {
      res.status(404).json({ error: 'Customer not found' }); 
    }
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({ error: 'Failed to retrieve customer' }); 
  }
});

app.get('/customers/phone/:phone',authenticateToken, async (req, res) => {
  const phone = req.params.phone;

  try {
    const customer = await CustomerRepo.getCustomerByPhone(phone);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({ error: 'Failed to retrieve customer' });
  }
}); 

app.get('/customers/:phone/suppliers',authenticateToken, async (req, res) => {
  try {
    const phone = req.params.phone;
    const customer = await CustomerRepo.getsuppliersofCustomersByPhone(phone);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/customers/product/:productName',authenticateToken, async (req, res) => {
  const productName = req.params.productName;
  try {
    const customers = await CustomerRepo.getCustomersByProductName(productName);
    res.json(customers);
  } catch (error) {
    console.error('Error retrieving customers by product name:', error);
    res.status(500).json({ error: 'Failed to retrieve customers by product name' });
  }
});

app.put('/customers/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { FirstName, LastName, City, Country, Phone } = req.body;
  try {
    const updatedPhoto = await CustomerRepo.updatecustomer(Number(id),  FirstName, LastName, City, Country, Phone);
    res.json(updatedPhoto);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

app.delete('/customers/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await CustomerRepo.deletecustomer(Number(id));
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});



app.post('/supplier', async (req, res) => {
  const { Id, CompanyName, ContactName, City, Country, Phone, Fax } = req.body;
  try {
    const supplier = await SupplierRepo.createsupplier(Id, CompanyName, ContactName, City, Country, Phone, Fax);
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create.' });
  }
});

app.get('/supplier',authenticateToken, async (req, res) => {
  try {
    const supplier = await SupplierRepo.getAllSuppliers();
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve.' });
  }
});

app.get('/supplier/:id',authenticateToken, async (req, res) => {
  const supplierId = parseInt(req.params.id, 10); 

  try {
    const supplier = await SupplierRepo.getSuppliersById(supplierId); 
    if (supplier) {
      res.json(supplier); 
    } else {
      res.status(404).json({ error: 'supplier not found' }); 
    }
  } catch (error) {
    console.error('Error retrieving supplier:', error);
    res.status(500).json({ error: 'Failed to retrieve supplier' }); 
  }
});

app.get('/supplier/phone/:phone',authenticateToken, async (req, res) => {
  const phone = req.params.phone;
  try {
    const supplier = await SupplierRepo.getSupplierByPhone(phone);
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ error: 'supplier not found' });
    }
  } catch (error) {
    console.error('Error retrieving supplier:', error);
    res.status(500).json({ error: 'Failed to retrieve supplier' });
  }
}); 

app.get('/suppliers/product/:productName',authenticateToken, async (req, res) => {
  const productName = req.params.productName;
  try {
    const suppliers = await SupplierRepo.getSuppliersByProductName(productName);
    res.json(suppliers);
  } catch (error) {
    console.error('Error retrieving suppliers by product name:', error);
    res.status(500).json({ error: 'Failed to retrieve suppliers by product name' });
  }
});

app.put('/supplier/:id', async (req, res) => {
  const { id } = req.params;
  const {Id, CompanyName, ContactName, City, Country, Phone, Fax} = req.body;
  try {
    const updatedsup = await SupplierRepo.updatesupplier(Number(id),  Id, CompanyName, ContactName, City, Country, Phone);
    res.json(updatedsup);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

app.delete('/supplier/:id',authenticateToken,  async (req, res) => {
  const { id } = req.params;
  try {
    const result = await SupplierRepo.deletesupplier(Number(id));
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

  

app.post('/orders', async (req, res) => {
  const { OrderDate, CustomerId, TotalAmount, OrderNumber} = req.body;
  try {
    const order = await orderRepo.createOrder(OrderDate, CustomerId, TotalAmount, OrderNumber);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});
 
app.post('/place-order', async (req, res) => {
  try {
    const { customerPhone, productIds, quantities } = req.body;

    if (!Array.isArray(productIds) || !Array.isArray(quantities) || productIds.length !== quantities.length) {
      throw new Error('Invalid product quantities');
    }

    const productQuantities = productIds.map((productId, index) => ({ productId, quantity: quantities[index] }));
    const newOrder = await orderRepo.placeOrder(customerPhone, productQuantities);

    res.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Error while placing order:", error);
    res.status(500).json({ success: false, error: 'Failed to create order.' });
  }
});
 
app.post('/close-order', async (req, res) => {
    try {
        const { customerPhone, paymentAmount } = req.body;

        const closedOrder = await orderRepo.closeOrder(customerPhone, paymentAmount);

        res.json({ success: true, order: closedOrder });
    } catch (error) {
        console.error("Error while closing order:", error);
        res.status(500).json({ success: false, error: 'Failed to close order.' });
    }
});

app.get('/orders',authenticateToken, async (req, res) => {
  try {
    const orders = await orderRepo.getAllOrders(); 
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

app.get('/orders/:id',authenticateToken, async (req, res) => {
  const orderId = parseInt(req.params.id, 10); 

  try {
    const order = await orderRepo.getOrdersById(orderId); 
    if (order) {
      res.json(order); 
    } else {
      res.status(404).json({ error: 'order not found' }); 
    }
  } catch (error) {
    console.error('Error retrieving order:', error);
    res.status(500).json({ error: 'Failed to retrieve order' }); 
  }
});

app.get('/orders/customer/:phone',authenticateToken, async (req, res) => {
  const phone = req.params.phone; 

  try {
    const customer = await CustomerRepo.getCustomerWithOrdersByPhone(phone); 
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({ error: 'Failed to retrieve customer' });
  }
});

app.get('/ProductsofCustomersByPhone/:phone',authenticateToken, async (req, res) => {
  try {
    const phone = req.params.phone;
    const customer = await CustomerRepo.getProductsofCustomersByPhone(phone);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/customers-10-products/:phone',authenticateToken, async (req, res) => {
  try {
    const phone = req.params.phone;
    const products = await CustomerRepo.suggestNewOrdersByPhone(phone);

    if (!products) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { OrderDate, CustomerId, TotalAmount, OrderNumber } = req.body;
  try {
    const updatedOrder = await OrderRepo.updateOrder(Number(id), OrderDate, CustomerId, TotalAmount, OrderNumber);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.delete('/orders/:id',authenticateToken,  async (req, res) => {
  const { id } = req.params;
  try {
    const result = await OrderRepo.deleteOrder(Number(id));
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});



app.post('/products', async (req, res) => {
  const { ProductName, SupplierId, UnitPrice, Package, IsDiscontinued } = req.body;
  try {
    const product = await productRepo.createProduct(ProductName, SupplierId, UnitPrice, Package, IsDiscontinued);
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

app.get('/products',authenticateToken, async (req, res) => {
  try {
    const products = await productRepo.getAllProducts(); 
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

app.get('/products/:id',authenticateToken, async (req, res) => {
  const productId = parseInt(req.params.id, 10); 

  try {
    const product = await productRepo.getProductsById(productId); 
    if (product) {
      res.json(product); 
    } else {
      res.status(404).json({ error: 'product not found' }); 
    }
  } catch (error) {
    console.error('Error retrieving product:', error);
    res.status(500).json({ error: 'Failed to retrieve product' }); 
  }
});

app.get('/products/suppliers/:phone',authenticateToken, async (req, res) => {
  const phone = req.params.phone; 

  try {
    const supplier = await SupplierRepo.getSupplierWithProductsByPhone(phone); 
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ error: 'supplier not found' });
    }
  } catch (error) {
    console.error('Error retrieving supplier:', error);
    res.status(500).json({ error: 'Failed to retrieve supplier' });
  }
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { ProductName, SupplierId, UnitPrice, Package, IsDiscontinued } = req.body;
  try {
    const updatedProduct = await OrderRepo.updateProduct(Number(id), ProductName, SupplierId, UnitPrice, Package, IsDiscontinued);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.delete('/products/:id',authenticateToken,  async (req, res) => {
  const { id } = req.params;
  try {
    const result = await ProductRepo.deleteProduct(Number(id));
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});



app.post('/orderitems', async (req, res) => {
  const { OrderId, ProductId, UnitPrice, Quantity } = req.body;
  try {
    const orderItem = await orderItemRepo.createOrderItem(OrderId, ProductId, UnitPrice, Quantity);
    res.json(orderItem);
  } catch (error) {
    console.error('Error creating order item:', error);
    res.status(500).json({ error: 'Failed to create order item.' });
  }
});

app.get('/orderitems',authenticateToken, async (req, res) => {
  try {
    const orderItems = await orderItemRepo.getAllOrderItems();
    res.json(orderItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve order items.' });
  }
});

app.get('/orderitems/:id',authenticateToken, async (req, res) => {
  const orderitemId = parseInt(req.params.id, 10); 

  try {
    const orderitem = await orderItemRepo.getOrderItemsById(orderitemId); 
    if (orderitem) {
      res.json(orderitem); 
    } else {
      res.status(404).json({ error: 'orderitem not found' }); 
    }
  } catch (error) {
    console.error('Error retrieving orderitem:', error);
    res.status(500).json({ error: 'Failed to retrieve orderitem' }); 
  }
});

app.get('/customerWithOrdersAndItems/:phone',authenticateToken, async (req, res) => {
  try {
    const phone = req.params.phone;
    const customer = await CustomerRepo.getCustomerWithOrdersAndItemsByPhone(phone); // Use customerRepo instead of CustomerRepo
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Not found'}); // Send the actual error message
  }
});

app.put('/orderitems/:id', async (req, res) => {
  const { id } = req.params;
  const { OrderId, ProductId, UnitPrice, Quantity } = req.body;
  try {
    const updatedOrderItem = await orderItemRepo.updateOrderItem(Number(id), OrderId, ProductId, UnitPrice, Quantity);
    res.json(updatedOrderItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order item' });
  }
});

app.delete('/orderitems/:id',authenticateToken,  async (req, res) => {
  const { id } = req.params;
  try {
    const result = await orderItemRepo.deleteOrderItem(Number(id));
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order item' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
}).catch((err) => console.log('Error in connecting to db.', err));