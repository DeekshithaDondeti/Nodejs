import { getDatabaseConnection } from '../database';
import { Product } from '../entities/product';
import { Supplier  } from '../entities/supplier';
import { FindOneOptions, getRepository } from 'typeorm';

export class supplierRepository {
  private connection = getDatabaseConnection();
  getProductsById: any;
  supplierRepository: any;

  async createsupplier(Id: number, CompanyName: string, ContactName: string, City: string, Country: string, Phone: string, Fax: string | null): Promise<Supplier> {
    const supplier = new Supplier();
    supplier.Id = Id;
    supplier.CompanyName = CompanyName;
    supplier.ContactName = ContactName;
    supplier.City = City;
    supplier.Country = Country;
    supplier.Phone = Phone;
    if (Fax !== null) {
      supplier.Fax = Fax;
    }
    return this.connection.manager.save(supplier);
  }

  async updatesupplier(Id: number, CompanyName: string, ContactName: string, City: string, Country: string, Phone: string,Fax: string): Promise<Supplier | undefined> {
    const supplier = await this.connection.manager.findOne(Supplier, { where: { Id } });
    if (!supplier) {
      throw new Error('customer not found');
    }
    supplier.Id = Id;
    supplier.CompanyName = CompanyName;
    supplier.ContactName = ContactName;
    supplier.City = City;
    supplier.Country = Country;
    supplier.Phone = Phone
    supplier.Fax = Fax;
    return this.connection.manager.save(supplier);
  }

  async deletesupplier(Id: number): Promise<boolean> {
    const supplier = await this.connection.manager.findOne(Supplier, { where: { Id } });
    if (!supplier) {
      throw new Error('Photo not found');
    }
    await this.connection.manager.remove(supplier);
    return true;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return this.connection.manager.find(Supplier);
  }

  async getSuppliersById(Id: number): Promise<Supplier | undefined> {
    const options: FindOneOptions<Supplier> = { where: { Id } };
    const customer = await this.connection.manager.findOne(Supplier, options);
    return customer || undefined;
  }

  async getSupplierByPhone(phone: string): Promise<Supplier | undefined> {
    const customer = await this.connection.manager.findOne(Supplier, { where: { Phone: phone } });
    return customer || undefined;
  }

  constructor() {
    this.supplierRepository = getRepository(Supplier);
  }

  async getSupplierWithProductsByPhone(phone: string): Promise<Supplier | undefined> {
      const supplier = await this.supplierRepository
        .createQueryBuilder('supplier')
        .leftJoinAndSelect('supplier.products', 'product')
        .where('supplier.Phone = :phone', { phone }) 
        .getOne();
      return supplier || undefined;
  }

  async getSuppliersByProductName(productName: string): Promise<Supplier[]> {
    const query = this.supplierRepository
      .createQueryBuilder('supplier')
      .innerJoin('supplier.products', 'product')
      .where('product.ProductName = :productName', { productName })
      .getSql();
    console.log('Generated SQL query:', query);
    const suppliers = await this.supplierRepository
      .createQueryBuilder('supplier')
      .innerJoin('supplier.products', 'product')
      .where('product.ProductName = :productName', { productName })
      .getMany();
    return suppliers || [];
    }
}
