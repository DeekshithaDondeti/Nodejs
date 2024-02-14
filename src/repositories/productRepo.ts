import { getDatabaseConnection } from '../database';
import { Product } from '../entities/product';
import { FindOneOptions } from 'typeorm';

export class ProductRepo {
  static updateproduct: any;
  static deleteproduct: any;
  static deleteProduct: any;
  getOrderItemsById: any;
  getProductById: any;
  static getAllproducts() {
    throw new Error('Method not implemented.');
  }
  static createproducts( ProductName: any, SupplierId: any, UnitPrice: any, Package: any, IsDiscontinued: any) {
    throw new Error('Method not implemented.');
  }
  private connection = getDatabaseConnection();

  async createProduct(ProductName: string, SupplierId: number, UnitPrice: number, Package:string, IsDiscontinued: number): Promise<Product> {
    const product = new Product();
    product.ProductName = ProductName;
    product.SupplierId = SupplierId;
    product.UnitPrice = UnitPrice;
    product.Package = Package;
    product.IsDiscontinued = IsDiscontinued;
    return this.connection.manager.save(product);
  }  
  
  async updateProduct(Id: number, ProductName: string, SupplierId: number, UnitPrice: number, Package: string, IsDiscontinued: number): Promise<Product | undefined> {
    const product = await this.connection.manager.findOne(Product, { where: { Id } });

    if (!product) {
      throw new Error('Order not found');
    }
    product.ProductName = ProductName;
    product.SupplierId = SupplierId;
    product.UnitPrice = UnitPrice;
    product.Package = Package;
    product.IsDiscontinued = IsDiscontinued;
    return this.connection.manager.save(product);
  }

  async deleteProduct(Id: number): Promise<boolean> {
    const product = await this.connection.manager.findOne(Product, { where: { Id } });

    if (!product) {
      throw new Error('Order not found');
    }

    await this.connection.manager.remove(product);
    return true;
  }

  async getAllProducts(): Promise<Product[]> {
    return this.connection.manager.find(Product);
  }

  async getProductsById(Id: number): Promise<Product | undefined> {
    const options: FindOneOptions<Product> = { where: { Id } };
    const customer = await this.connection.manager.findOne(Product, options);
    return customer || undefined;
  }
}

export default ProductRepo;
