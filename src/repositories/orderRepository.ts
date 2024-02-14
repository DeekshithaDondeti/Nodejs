import { getDatabaseConnection } from '../database';
import { Order } from '../entities/order';
import { Customer } from "../entities/customer";
import { Product } from "../entities/product";
import { FindOneOptions, getRepository } from 'typeorm';
import { OrderItem } from '../entities/orderitem';

export class OrderRepo {

  private orderRepository = getRepository(Order);
  private customerRepository = getRepository(Customer);
  private productRepository = getRepository(Product);
  private orderItemRepository = getRepository(OrderItem);
  private connection = getDatabaseConnection();
 
  static updateOrder: any;
  static deleteOrder: any;
  static updateProduct: any;
  getOrdersByCustomerId: any;
  orderitemRepo: any;

  async createOrder(OrderDate: string, CustomerId: number, TotalAmount: number, OrderNumber:string): Promise<Order> {
    const order = new Order();
    order.OrderDate = OrderDate;
    order.CustomerId = CustomerId;
    order.TotalAmount = TotalAmount;
    order.OrderNumber = OrderNumber;
    return this.connection.manager.save(order);
  }  
  
  async updateOrder(Id: number, OrderDate:string, CustomerId: number, TotalAmount: number, OrderNumber:string): Promise<Order | undefined> {
    const order = await this.connection.manager.findOne(Order, { where: { Id } });
    if (!order) {
      throw new Error('Order not found');
    }
    order.OrderDate = OrderDate;
    order.CustomerId = CustomerId;
    order.TotalAmount = TotalAmount;
    order.OrderNumber = OrderNumber;
    return this.connection.manager.save(order);
  }

  async deleteOrder(Id: number): Promise<boolean> {
    const order = await this.connection.manager.findOne(Order, { where: { Id } });
    if (!order) {
      throw new Error('Order not found');
    }
    await this.connection.manager.remove(order);
    return true;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.connection.manager.find(Order);
  }

  async getOrdersById(Id: number): Promise<Order | undefined> {
    const options: FindOneOptions<Order> = { where: { Id } };
    const customer = await this.connection.manager.findOne(Order, options);
    return customer || undefined;
  }

  
  async placeOrder(customerPhone: string, productsWithQuantities: { productId: number, quantity: number }[]): Promise<Order> {
    try {
        const customer = await this.customerRepository.findOne({ where: { Phone: customerPhone }, relations: ["orders"] });
        if (!customer) {
            throw new Error(`Customer with phone number ${customerPhone} not found`);
        }

        let openOrder = customer.orders.find(order => order.IsOpenOrder);

        if (!openOrder) {
            openOrder = new Order();
            openOrder.OrderDate = new Date().toISOString();
            openOrder.CustomerId = customer.Id;
            openOrder.OrderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(7)}`;
            openOrder.IsOpenOrder = true;
            openOrder.orderItems = [];
            openOrder = await this.orderRepository.save(openOrder);
        }

        const productIds = productsWithQuantities.map(pq => pq.productId);
        const products = await this.productRepository.findByIds(productIds);
        if (products.length !== productIds.length) {
            throw new Error("One or more products not found");
        }

        const orderItems = productsWithQuantities.map(pq => {
            const product = products.find(p => p.Id === pq.productId);
            if (!product) {
                throw new Error(`Product with ID ${pq.productId} not found`);
            }
            const orderItem = new OrderItem();
            orderItem.OrderId = openOrder!.Id;
            orderItem.ProductId = product.Id;
            orderItem.UnitPrice = product.UnitPrice;
            orderItem.Quantity = pq.quantity;
            return orderItem;
        });

        const newTotalAmount = orderItems.reduce((sum, orderItem) => sum + (orderItem.UnitPrice * orderItem.Quantity), 0);
        openOrder.TotalAmount += newTotalAmount;

        await this.orderRepository.save(openOrder);
        await this.orderItemRepository.save(orderItems);

        return openOrder;
    } catch (error) {
        console.error("Error while placing order:", error);
        throw new Error(`Failed to place order`);
    }
}


async closeOrder(customerPhone: string, paymentAmount: number): Promise<Order> {
  try {
      const customer = await this.customerRepository.findOne({ where: { Phone: customerPhone }, relations: ["orders"] });
      if (!customer) {
          throw new Error(`Customer with phone number ${customerPhone} not found`);
      }

      const openOrder = customer.orders.find(order => order.IsOpenOrder);

      if (!openOrder) {
          throw new Error(`No open order found for customer with phone number ${customerPhone}`);
      }

      openOrder.AmountPaid += paymentAmount;
      openOrder.TotalAmount -= paymentAmount;

      if (openOrder.TotalAmount <= 0) {
          openOrder.IsOpenOrder = false;
      }

      await this.orderRepository.save(openOrder);

      return openOrder;
  } catch (error) {
      console.error("Error while closing order:", error);
      throw new Error(`Failed to close order`);
  }
}
  
}

export default OrderRepo;