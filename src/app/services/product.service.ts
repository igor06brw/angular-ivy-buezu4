import { Injectable, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  scan,
  map,
  merge,
  Observable,
  of,
  Subject,
  tap,
  shareReplay,
  concatMap,
  mergeMap,
  switchMap,
  delay,
} from 'rxjs';
import { Product, ProductCategory } from '../interfaces/product';
@Injectable({
  providedIn: 'root',
})
export class ProductService implements OnInit {
  products$ = of([
    {
      id: 1,
      productName: 'abc',
      description: 'desc1',
      price: 1.99,
      category: 'aaa',
      categoryId: 1,
    },
    {
      id: 2,
      productName: 'def',
      description: 'desc2',
      price: 2.99,
      category: 'aaa',
      categoryId: 1,
    },
    {
      id: 3,
      productName: 'gfh',
      description: 'desc3',
      price: 3.99,
      category: 'bbb',
      categoryId: 1,
    },
    {
      id: 4,
      productName: 'ijk',
      description: 'desc4',
      price: 3.99,
      category: 'bbb',
      categoryId: 2,
    },
  ]);

  observableCategories$ = of([
    {
      id: 1,
      indexedCategory: 1,
      description: 'example of desc from observable of 1',
    },
    {
      id: 2,
      indexedCategory: 2,
      description: 'example of desc from observable of 2',
    },
  ]).pipe(
    shareReplay(1),
    tap((data) => console.log('After shareReplay'))
  );

  private fakeProduct(): Product {
    return {
      id: 5,
      productName: 'lmn',
      description: 'desc5',
      price: 4.99,
      category: 'bbb',
      categoryId: 2,
    };
  }

  productsWithConcatMap$ = of(1, 3, 5).pipe(
    tap((id) => console.log('concatMap source Observable', id)),
    concatMap((id) => this.products$),
    delay(700)
  );

  productsWithMergeMap$ = of(2, 4, 6).pipe(
    tap((id) => console.log('mergeMap source Observable', id)),
    mergeMap((id) => this.products$),
    delay(700)
  );

  productsWithSwitchMap$ = of(8, 12, 16).pipe(
    tap((id) => console.log('switchMap source Observable', id)),
    switchMap((id) => this.products$),
    delay(700)
  );

  selectedCategoryId: number;

  errorMessage = '';

  productsWithCategory$: Observable<Product[]>;

  categories: ProductCategory[] = [];

  doubledProducts$: Observable<Product[]>;

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productsWithAdd$ = merge(
    this.getProductsWithCategories(),
    this.productInsertedAction$
  ).pipe(
    scan(
      (acc, value) => (value instanceof Array ? [...value] : [...acc, value]),
      [] as Product[]
    )
  );

  constructor() {
    this.productsWithConcatMap$.subscribe((item) =>
      console.log('concatMap result', item)
    );

    this.productsWithMergeMap$.subscribe((item) =>
      console.log('mergeMap result', item)
    );

    this.productsWithSwitchMap$.subscribe((item) =>
      console.log('switchMap result', item)
    );
  }

  ngOnInit() {}

  changeDescToCategory(value: Product) {
    let changedValue: Product;
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getCategories(): Observable<ProductCategory[]> {
    return this.observableCategories$;
  }

  getDoublePriceOfProducts(): Observable<Product[]> {
    return this.products$.pipe(
      map((products: Product[]) => {
        return products.map(
          (product: Product) =>
            ({
              ...product,
              price: product.price * 2,
            } as Product)
        );
      })
    );
  }

  getProductsByCategory() {
    return this.products$.pipe(
      map((products: Product[]) => {
        return products.filter((product) => product.category === 'aaa');
      })
    );
  }

  getProductsWithCategories(): Observable<Product[]> {
    return (this.productsWithCategory$ = combineLatest([
      this.products$,
      this.observableCategories$,
    ]).pipe(
      map(([products, categories]) => {
        return products.map(
          (product) =>
            ({
              ...product,
              category: categories.find((c) => product.categoryId === c.id)
                .description,
            } as Product)
        );
      })
    ));
  }

  getFilteredProductsByCategory(categoryId) {
    console.log(categoryId, 'service');
    console.log(this.getProductsWithCategories(), 'service');
  }

  // selectedProduct$: Observable<Product | undefined> =
  //   this.getProductsByCategory().pipe(
  //     map((products) => products.find((product) => product.id === 2)),
  //     tap((product) => console.log('selectedProduct', product))
  //   );

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
    console.log(this.selectedProduct$, 'service');
  }

  selectedProduct$: Observable<Product | undefined> = combineLatest([
    this.getProductsWithCategories(),
    this.productSelectedAction$,
  ]).pipe(
    map(([products, selectedProductId]) =>
      products.find((product) => product.id === selectedProductId)
    ),
    tap((product) => console.log('selectedProduct', product))
  );

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }


  
}
