import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {CurrencyPipe, NgClass} from '@angular/common';

@Component({
  selector: 'app-banhang',
  templateUrl: './banhang.component.html',
  imports: [
    FormsModule,
    NgClass,
    CurrencyPipe,
    CommonModule
  ],
  styleUrls: ['./banhang.component.css']
})
export class BanhangComponent {
  searchText: string = '';
  selectedCategory: string = '';
  invoices: number[] = [1]; // Danh sách hóa đơn
  selectedTab: number = 0;
  discountCode: string = '';
  discountAmount: number = 0;
  selectedPaymentMethod: string = 'cash';

  products = [
    { id: 1, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 2, name: 'Giày Nike Phantom', price: 2700000, stock: 5, image: 'assets/nike-phantom.jpg' },
    { id: 3, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 4, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 5, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 6, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 7, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 8, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 9, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 10, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 11, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 12, name: 'Giày Nike Mercurial', price: 2500000, stock: 10, image: 'assets/nike-mercurial.jpg' },
    { id: 13, name: 'Giày Nike Tiempo', price: 2300000, stock: 2, image: 'assets/nike-tiempo.jpg' }
  ];

  cart: any[] = [];
  categories = ['Nike Mercurial', 'Nike Phantom', 'Nike Tiempo'];

  // Lọc sản phẩm theo danh mục hoặc tìm kiếm
  filteredProducts() {
    return this.products.filter(product =>
      (this.selectedCategory === '' || product.name.includes(this.selectedCategory)) &&
      (this.searchText === '' || product.name.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  // Xem chi tiết sản phẩm
  viewProductDetails(product: any) {
    console.log('Xem chi tiết sản phẩm:', product);
    alert(`Sản phẩm: ${product.name}\nGiá: ${product.price.toLocaleString()} VND`);
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(product: any) {
    const existingItem = this.cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
      } else {
        alert('Số lượng sản phẩm không đủ!');
      }
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart(item: any) {
    this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
  }

  // Kiểm tra số lượng giỏ hàng
  validateQuantity(item: any) {
    const product = this.products.find(p => p.id === item.id);
    if (!product) {
      alert('Sản phẩm không tồn tại!');
      return;
    }

    if (item.quantity < 1 || isNaN(item.quantity)) {
      item.quantity = 1;
    } else if (item.quantity > product.stock) {
      item.quantity = product.stock;
      alert('Số lượng sản phẩm không đủ!');
    }
  }


  // Tính tổng tiền giỏ hàng
  getTotal() {
    return this.cart.reduce((total, item) => total + item.price * item.quantity, 0) - this.discountAmount;
  }

  // Áp dụng mã giảm giá
  applyDiscount() {
    if (this.discountCode === 'GIAM10') {
      this.discountAmount = this.getTotal() * 0.1;
    } else {
      this.discountAmount = 0;
      alert('Mã giảm giá không hợp lệ!');
    }
  }

  // Chọn tab hóa đơn
  selectTab(index: number) {
    this.selectedTab = index;
  }

  // Tạo hóa đơn mới
  createInvoice() {
    this.invoices.push(this.invoices.length + 1);
    this.selectedTab = this.invoices.length - 1;
  }

  // Xóa hóa đơn
  removeInvoice(index: number, event: Event) {
    event.stopPropagation();
    if (this.invoices.length > 1) {
      this.invoices.splice(index, 1);
      this.selectedTab = this.invoices.length - 1;
    }
  }


  // Xác nhận thanh toán
  checkout() {
    if (this.cart.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }

    alert(`Thanh toán thành công bằng ${this.selectedPaymentMethod.toUpperCase()}!`);
    this.cart = [];
    this.discountCode = '';
    this.discountAmount = 0;
  }
}
