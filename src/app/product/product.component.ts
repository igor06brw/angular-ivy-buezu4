import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  filter,
  map,
  Observable,
  pipe,
  Subject,
  tap,
  combineLatest,
  catchError,
  EMPTY,
  startWith,
  BehaviorSubject,
} from 'rxjs';
import { Product, ProductCategory } from '../interfaces/product';
import { ProductService } from '../services/product.service';
@Component({
  selector: 'ng-product',
  templateUrl: './product.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  doubledProducts: Product[] = [];
  categorizedProducts: Product[] = [];
  categories$ = [];

  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  selectedProduct$ = this.productService.selectedProduct$;

  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$.pipe(startWith(0)),
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.filter((product) =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
      )
    ),
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  constructor(private productService: ProductService) {}

  // productsSimpleFilter$ = this.productService.getProductsWithCategories().pipe(
  //   map((products) => {
  //     return products.filter((item) =>
  //       this.selectedCategoryId
  //         ? item.categoriesId === this.selectedCategoryId
  //         : true
  //     );
  //   })
  // );

  ngOnInit() {
    console.log(this.categories$);
    this.productService
      .getCategories()
      .subscribe(
        (category) => (this.categories$ = [...this.categories$, ...category])
      );
    this.productService.getProducts().subscribe((product) => {
      this.products = [...this.products, ...product];
      // console.log(this.products);
    });
    this.productService
      .getDoublePriceOfProducts()
      .subscribe(
        (product) =>
          (this.doubledProducts = [...this.doubledProducts, ...product])
      );
    // this.productService
    //   .getProductsByCategory()
    //   .subscribe(
    //     (product) =>
    //       (this.categorizedProducts = [...this.categorizedProducts, ...product])
    //   );
    this.productService
      .getProductsWithCategories()
      .subscribe(
        (product) =>
          (this.categorizedProducts = [...this.categorizedProducts, ...product])
      );
  }

  onSelected(categoryId): void {
    console.log(+categoryId);

    this.categorySelectedSubject.next(+categoryId);

    // this.selectedCategoryId = +categoryId;
    // return (this.productsSimpleFilter$ = this.productService
    //   .getProductsWithCategories()
    //   .pipe(
    //     map((products) => {
    //       return products.filter((item) =>
    //         this.selectedCategoryId
    //           ? item.categoriesId === this.selectedCategoryId
    //           : true
    //       );
    //     })
    //   ));
  }

  onSelectedProduct(productId: number) {
    console.log(productId);
    this.productService.selectedProductChanged(productId);
  }

  onAdd(): void {
    this.productService.addProduct();
  }
}
