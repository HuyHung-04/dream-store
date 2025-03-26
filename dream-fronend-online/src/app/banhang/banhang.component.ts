import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BanhangService } from './banhang.service';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-banhang',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,HeaderComponent],
  templateUrl: './banhang.component.html',
  styleUrl: './banhang.component.css'
})
export class BanhangComponent{
  @ViewChild('searchResultsContainer') searchResultsContainer!: ElementRef;
  sanPhamOnlines: any[] = [];
  totalPages: number = 0;
  currentPage: number = 0;
  size: number = 20;
 // Khai báo biến lưu trữ kết quả tìm kiếm
 searchResults: any[] = [];
 isSearching: boolean = false;
  constructor(private banHangService : BanhangService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadData();
  // Kiểm tra dữ liệu trả về
  this.banHangService.searchResults$.subscribe((results) => {
    console.log('searchResults:', results);  // Kiểm tra xem đây có phải là mảng không
    this.searchResults = results;
    this.sanPhamOnlines = [...this.searchResults];  // Đảm bảo đây là một mảng
  });
  this.banHangService.isSearching$.subscribe((a) => {
    console.log('isSearching:', a);
    this.isSearching = a;

    // Gọi scrollToResults() khi isSearching thay đổi
    if (this.isSearching) {
      setTimeout(() => {
        this.scrollToResults();
      }, 100); // Trễ một chút để đảm bảo UI đã render
    }
  });
  }
  scrollToResults() {
    if (this.searchResultsContainer) {
      this.searchResultsContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  loadData(): void {
    this.loadSanPhamOnline(0);
  }

  loadSanPhamOnline(page: number): void {
    this.banHangService.getSanPhamOnline(page, this.size).subscribe(
      (data) => {
        this.sanPhamOnlines = data.content; // Dữ liệu sản phẩm
        this.totalPages = data.totalPages; // Tổng số trang
        this.currentPage = page;
      },
      (error) => {
        console.error('Lỗi khi gọi API:', error);
      }
    );
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.loadSanPhamOnline(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.loadSanPhamOnline(this.currentPage - 1);
    }
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
      if (params['scroll']) {
        setTimeout(() => {
          const productList = document.getElementById('product-list');
          if (productList) {
            productList.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Dịch lên để không bị che
            // setTimeout(() => {
            //   window.scrollBy(0, -50);
            // }, 500);
          }
        }, 500);
      }
    });
  }
}
