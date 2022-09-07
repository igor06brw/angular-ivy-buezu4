export interface Product {
  id: number;
  productName: string;
  description?: string;
  price?: number;
  category?: string;
  categoryId?: number;
}

export interface ProductCategory {
  id: number;
  indexedCategory?: number;
  description?: string;
}
