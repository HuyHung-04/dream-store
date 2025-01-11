import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SanphamService } from './sanpham.service';

@Component({
  selector: 'app-sanpham',
  imports: [CommonModule],
  templateUrl: './sanpham.component.html',
  styleUrls: ['./sanpham.component.css']
})
export class SanphamComponent implements OnInit {
  sanPhams: any[] = [];
  thuongHieus: any[] = [];
  chatLieus: any[] = [];
  coAos: any[] = [];
  xuatXus: any[] = [];
  showModal: boolean = false; // Trạng thái để kiểm tra modal hiển thị hay không

  constructor(private sanphamService: SanphamService) {}

  ngOnInit(): void {
    this.loadData()
  }

  // hàm load 
  loadData() : void{
  this.listSanPham()
  this.listThuongHieu()
  this.listChatLieu()
  this.listCoAo()
  this.listXuatXu()
  }

  listSanPham(): void{
   // Lấy danh sách sản phẩm từ service
   this.sanphamService.getSanPham().subscribe(data => {
    console.log("data",data)
    this.sanPhams = data;
  });
  }

  listThuongHieu(): void{
    // lấy danh sách thương hiệu từ service
    this.sanphamService.getThuongHieu().subscribe(data => {
      console.log("data", data)
      this.thuongHieus = data;
    });
  }

  listChatLieu(): void{
    // lấy danh sách chất liệu từ service
    this.sanphamService.getChatLieu().subscribe(data => {
      console.log("data",data)
      this.chatLieus = data;
    });
  }

  listCoAo(): void{
    // lấy danh sách chất liệu từ service
    this.sanphamService.getCoAo().subscribe(data => {
      console.log("data",data)
      this.coAos = data;
    });
  }

  listXuatXu(): void{
    // lấy danh sách chất liệu từ service
    this.sanphamService.getXuauXu().subscribe(data => {
      console.log("data",data)
      this.xuatXus = data;
    });
  }

  // Hàm mở modal
  openModal() {
    this.showModal = true;
  }

  // Hàm đóng modal
  closeModal() {
    this.showModal = false;
  }
}
