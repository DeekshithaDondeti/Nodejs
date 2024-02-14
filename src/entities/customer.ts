import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { Order } from "./order";

@Entity()
@Unique(["Phone"]) 
export class Customer {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    FirstName: string;

    @Column()
    LastName: string;

    @Column()
    City: string;

    @Column()
    Country: string;

    @Column()
    Phone: string;

    @OneToMany(() => Order, order => order.customer)
    orders: Order[];
}
