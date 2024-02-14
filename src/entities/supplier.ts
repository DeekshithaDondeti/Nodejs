import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from "typeorm"
import { Product } from "./product";

@Entity()
@Unique(["Phone"]) 
export class Supplier {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    CompanyName: string;

    @Column()
    ContactName: string;

    @Column()
    City: string;

    @Column()
    Country: string;

    @Column()
    Phone: string;

    @Column({ nullable: true })
    Fax: string;

    @OneToMany(() => Product, product => product.supplier)
    products: Product[];
}
