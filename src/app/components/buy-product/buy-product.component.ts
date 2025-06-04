import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from 'src/app/services/produit.service';
import { OrderDetails } from 'src/app/model/order-details.model';
import { Product } from 'src/app/model/product.model';

@Component({
  selector: 'app-buy-product',
  templateUrl: './buy-product.component.html',
  styleUrls: ['./buy-product.component.css']
})
export class BuyProductComponent implements OnInit {
  productDetails!: any[];
  orderDetails: OrderDetails={
      fullName:'',
        fullAddress:'',
        contactNumber:'',
        alternateContactNumber:'',
        orderProductQuantityList:[],

  }
  constructor(private activatedRoute: ActivatedRoute, private productService :ProduitService,private router:Router){}
  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      console.log("ngOnInit appelé via subscribe !");
      this.productDetails = data['productDetails'];
  
      this.productDetails.forEach(x =>
        this.orderDetails.orderProductQuantityList.push({ id: x.id, quantity: 1 })
      );
  
      console.log(this.productDetails);
      console.log(this.orderDetails);
    });
  }
  
  
  public placeOrder(orderForm: NgForm){
    this.productService.placeOrder(this.orderDetails).subscribe(
      (resp)=>{
        console.log(resp);
        orderForm.reset();
        this.router.navigate(["/orderConfirm"]);

      },
      (err)=>{
        console.log(err);
      }
    );

  }
  getQuantityForProduct(id: number){
    const filteredProduct = this.orderDetails.orderProductQuantityList.filter(
      (productQuantity) => productQuantity.id === id
    );
    return filteredProduct[0].quantity;
  }
  getCalculatedTotal(id: number, prix: number){
    const filteredProduct = this.orderDetails.orderProductQuantityList.filter(
      (productQuantity) => productQuantity.id === id
    );
    return filteredProduct[0].quantity * prix ;

  }
  onQuantityChanged(q: number,id:number){
    this.orderDetails.orderProductQuantityList.filter(
      (orderProduct) => orderProduct.id === id
    )[0].quantity = q;

  }
  getCalculatedGrandTotal(){
   let grandTotal = 0;
   this.orderDetails.orderProductQuantityList.forEach(
    (productQuantity) => {
      const price = this.productDetails.filter(product => product.id === productQuantity.id)[0].prix;
      grandTotal = grandTotal + price * productQuantity.quantity;


    }
   ) ;
   return grandTotal;
  }
}
