import { getDatabaseConnection } from '../database';
import { Customer  } from '../entities/customer';
import { FindOneOptions, getRepository, getConnection } from 'typeorm';
import { Product } from '../entities/product';

export class CustomerRepository {
  save: any;
  filter: any;

  existsByPhone(customerPhone: any) {
    throw new Error('Method not implemented.');
  }
  private connection = getDatabaseConnection();
  getOrdersByCustomerId: any;
  customerRepository: any;

  async createcustomer(FirstName: string, LastName: string, City: string, Country: string, Phone: string): Promise<Customer> {
    const customer = new Customer();
    customer.FirstName = FirstName;
    customer.LastName = LastName;
    customer.City = City;
    customer.Country = Country;
    customer.Phone = Phone
    return this.connection.manager.save(customer);
  }

  async updatecustomer(Id: number, FirstName: string, LastName: string, City: string, Country: string, Phone: string): Promise<Customer | undefined> {
    const customer = await this.connection.manager.findOne(Customer, { where: { Id } });

    if (!customer) {
      throw new Error('customer not found');
    }
    customer.FirstName = FirstName;
    customer.LastName = LastName;
    customer.City = City;
    customer.Country = Country;
    customer.Phone = Phone
    return this.connection.manager.save(customer);
  }

  async deletecustomer(Id: number): Promise<boolean> {
    const customer = await this.connection.manager.findOne(Customer, { where: { Id } });
    if (!customer) {
      throw new Error('customer not found');
    }
    await this.connection.manager.remove(customer);
    return true;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.connection.manager.find(Customer);
  }

  async getCustomerById(Id: number): Promise<Customer | undefined> {
    const options: FindOneOptions<Customer> = { where: { Id } };
    const customer = await this.connection.manager.findOne(Customer, options);
    return customer || undefined;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const customer = await this.connection.manager.findOne(Customer, { where: { Phone: phone } });
    return customer || undefined;
  }  

  constructor() {
    this.customerRepository = getRepository(Customer);
  }

  async getCustomerWithOrdersByPhone(phone: string): Promise<Customer | undefined> {
    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.orders', 'order')
      .where('customer.Phone = :phone', { phone })
      .getOne();

    return customer || undefined;
  }

  async getCustomerWithOrdersAndItemsByPhone(phone: string): Promise<Customer | undefined> {
      const customer = await this.customerRepository
        .createQueryBuilder('customer')
        .leftJoinAndSelect('customer.orders', 'order')
        .leftJoinAndSelect('order.orderItems', 'orderItem')
        .where('customer.Phone = :phone', { phone })
        .getOne();
  
      console.log('Customer:', customer); 
  
      return customer || undefined;
  }

  async getProductsofCustomersByPhone(phone: string): Promise<Customer | undefined> {
    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.orders', 'order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product') 
      .where('customer.Phone = :phone', { phone })
      .getOne();
  
    console.log('Customer:', customer);
    return customer || undefined;
  }

  async suggestNewOrdersByPhone(phone: string): Promise<{ product: Product, supplierName: string }[]> {
    try {
      const customer = await getConnection()
        .getRepository(Customer)
        .findOne({ where: { Phone: phone }, relations: ["orders", "orders.orderItems", "orders.orderItems.product"] });
  
      if (!customer) {
        throw new Error('Customer not found');
      }
  
      const productsBoughtIds = new Set<number>();
      customer.orders?.forEach(order => {
        order.orderItems?.forEach(item => {
          if (item.product) {
            productsBoughtIds.add(item.product.Id);
          }
        });
      });
  
      const productsNotBought = await getConnection()
        .getRepository(Product)
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.supplier", "supplier")
        .where("product.Id NOT IN (:...ids)", { ids: productsBoughtIds.size > 0 ? [...productsBoughtIds] : [0] })
        .getMany();
  
      const productsWithSupplierNames = productsNotBought
        .map(product => ({
          product,
          supplierName: product.supplier ? product.supplier.CompanyName : 'Unknown Supplier'
        }))
        .sort(() => Math.random() - 0.5) 
  
      console.log('Products not bought by customer with supplier names:', productsWithSupplierNames);
      return productsWithSupplierNames.slice(0, 10); 
    } catch (error) {
      console.error('Error in suggestNewOrdersByPhone:', error);
      throw error;
    }
  }

  async getsuppliersofCustomersByPhone(phone: string): Promise<Customer | undefined> {
    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.orders', 'order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.supplier', 'supplier') 
      .where('customer.Phone = :phone', { phone })
      .getOne();
    console.log('Customer:', customer);
    return customer || undefined;
  }

  async getCustomersByProductName(productName: string): Promise<Customer[]> {
    const customers = await this.customerRepository
      .createQueryBuilder('customer')
      .innerJoin('customer.orders', 'order')
      .innerJoin('order.orderItems', 'orderItem')
      .innerJoin('orderItem.product', 'product')
      .where('product.ProductName = :productName', { productName })
      .getMany();
    return customers || [];
  }

  async findByPhone(phone: string): Promise<Customer | undefined> {
    const customer = await this.customerRepository
      .leftJoinAndSelect('customer.orders', 'order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .where('customer.phone = :phone', { phone })
      .getOne();

    console.log('Customer:', customer);
    return customer || undefined;
  }

  async addCustomer(phone: string): Promise<Customer> {
    const customer = new Customer();
    customer.Phone = phone;
    await this.save(customer);
    return customer;
  }
  

}
