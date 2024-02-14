import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Order } from "./order";
import { Product } from "./product";

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    OrderId: number;

    @ManyToOne(() => Order, order => order.orderItems)
    @JoinColumn({ name: "OrderId" })
    Order: Order;

    @Column()
    ProductId: number;

    @ManyToOne(() => Product, product => product.orderItems)
    @JoinColumn({ name: "ProductId" })
    product: Product;

    @Column()
    UnitPrice: number;

    @Column()
    Quantity: number;

    @ManyToOne(() => Product, product => product.orderItems)
    @JoinColumn({ name: "ProductId", referencedColumnName: "Id" })
    Product: Product;
  productId: any;
     
}
