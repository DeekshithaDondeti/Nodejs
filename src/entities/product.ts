import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Supplier } from "./supplier";
import { OrderItem } from "./orderitem"

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    ProductName: string;

    @Column()
    SupplierId: number;

    @Column()
    UnitPrice: number;

    @Column()
    Package: string;

    @Column()
    IsDiscontinued: number;

    @ManyToOne(() => Supplier, supplier => supplier.products)
    @JoinColumn({ name: "SupplierId" }) 
    supplier: Supplier;

    @OneToMany(() => OrderItem, orderItem => orderItem.product)
    orderItems: OrderItem[];
}
