import { getDatabaseConnection } from '../database';
import { OrderItem } from '../entities/orderitem';
import { FindManyOptions, FindOneOptions } from 'typeorm';

export class OrderItemRepo {
  private connection = getDatabaseConnection();
  orderItemRepository: any;
  // getOrderItemsByCustomerId: any;

  async createOrderItem(OrderId: number, ProductId: number, UnitPrice: number, Quantity: number): Promise<OrderItem> {
    const orderItem = new OrderItem();
    orderItem.OrderId = OrderId;
    orderItem.ProductId = ProductId;
    orderItem.UnitPrice = UnitPrice;
    orderItem.Quantity = Quantity;
    return this.connection.manager.save(orderItem);
  }

  async updateOrderItem(Id: number, OrderId: number, ProductId: number, UnitPrice: number, Quantity: number): Promise<OrderItem | undefined> {
    const orderItem = await this.connection.manager.findOne(OrderItem, { where: { Id } });

    if (!orderItem) {
      throw new Error('Order item not found');
    }
    orderItem.OrderId = OrderId;
    orderItem.ProductId = ProductId;
    orderItem.UnitPrice = UnitPrice;
    orderItem.Quantity = Quantity;
    return this.connection.manager.save(orderItem);
  }

  async deleteOrderItem(Id: number): Promise<boolean> {
    const orderItem = await this.connection.manager.findOne(OrderItem, { where: { Id } });

    if (!orderItem) {
      throw new Error('Order item not found');
    }

    await this.connection.manager.remove(orderItem);
    return true;
  }

  async getAllOrderItems(): Promise<OrderItem[]> {
    return this.connection.manager.find(OrderItem);
  }

  async getOrderItemsById(Id: number): Promise<OrderItem | undefined> {
    const options: FindOneOptions<OrderItem> = { where: { Id } };
    const customer = await this.connection.manager.findOne(OrderItem, options);
    return customer || undefined;
  }

  async getOrderItemsByCustomerId(customerId: number): Promise<OrderItem[]> {
    const connection = getDatabaseConnection(); // Assuming this is your database connection function
    const query = `
      SELECT oi.*
      FROM order_item oi
      INNER JOIN "order" o ON oi.orderid = o.id  -- Adjust column names as needed, remove double quotes if not needed
      WHERE o.customerid = $1  -- Adjust column names as needed, remove double quotes if not needed
    `;
    const result = await connection.query(query, [customerId]);
    return result;
  }

}
