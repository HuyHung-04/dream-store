import { Component,OnInit  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChitietlichsuService } from './chitietlichsu.service';
import { CommonModule } from '@angular/common';
import { DonhangService } from '../donhang/donhang.service'; 
@Component({
  selector: 'app-chitietlichsu',
  imports: [CommonModule],
  templateUrl: './chitietlichsu.component.html',
  styleUrl: './chitietlichsu.component.css'
})
export class ChitietlichsuComponent {
  maHoaDon: string = '';  // Initialize with a default value
  chiTietHoaDonData: any;
  isLoading: boolean = false;  // To show loading state
  errorMessage: string = '';  // To hold error message
  hoaDonData: any;
  constructor(private route: ActivatedRoute, private chitietlichsuService: ChitietlichsuService,private donhangService: DonhangService ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.maHoaDon = params.get('id')!;
      if (this.maHoaDon) {
        this.getHoaDonDetails();  // Fetch the details for the current invoice
        this.getChiTietHoaDon(this.maHoaDon);  // Fetch the invoice details using the maHoaDon
      }
    });
    
  }

  

 
  // Method to fetch invoice details
  getHoaDonDetails(): void {
    if (this.maHoaDon) {
      this.isLoading = true;  // Show loading state
      console.log('Fetching details for Ma Hoa Don:', this.maHoaDon);

      this.chitietlichsuService.getHoaDonByMa(this.maHoaDon).subscribe(
        (data) => {
          this.hoaDonData = data;
          // console.log('Dữ liệu chi tiết hóa đơn nhận được:', this.hoaDonData);
          this.isLoading = false;  // Hide loading state
        },
        (error) => {
          console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
          this.errorMessage = 'Lỗi khi lấy chi tiết hóa đơn.';
          this.isLoading = false;  // Hide loading state
        }
      );
    }
  }

  // Phương thức gọi API lấy chi tiết hóa đơn
  getChiTietHoaDon(maHoaDon: string): void {
  
    this.donhangService.getChiTietHoaDon(this.maHoaDon).subscribe(
      (data) => {
        this.chiTietHoaDonData = data;
        console.log('Dữ liệu chi tiết hóa đơn nhận được:', this.chiTietHoaDonData);
      },
      (error) => {
        console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
      }
    );
    
  }
}
