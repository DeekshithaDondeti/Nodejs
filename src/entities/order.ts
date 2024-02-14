import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Customer } from "./customer";
import { OrderItem } from "./orderitem"

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    OrderDate: string;

    @Column()
    CustomerId: number;

    @Column({ nullable: true })
    TotalAmount: number;

    @Column()
    OrderNumber:string;

    @Column({ default: false }) 
    IsOpenOrder: boolean;

    @Column({ nullable: true, default: 0 })
    AmountPaid : number;
    

    @ManyToOne(() => Customer, customer => customer.orders)
    @JoinColumn({ name: "CustomerId" }) 
    customer: Customer;

    @OneToMany(type => OrderItem, orderItem => orderItem.Order)
    orderItems: OrderItem[];
}
