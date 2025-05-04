import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import {
  ThongKeService, ThongKeResponse, ThongKeThangResponse, ThongKeThangNayResponse,
  ThongKeHomNayResponse, TopSanPhamResponse
} from './thongke.service';

@Component({
  selector: 'app-thongke',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './thongke.component.html',
  styleUrls: ['./thongke.component.css'],
})
export class ThongkeComponent implements OnInit {
  thongKeData: ThongKeResponse | null = null;
  selectedType: string = 'Năm nay';
  chart: any;
  pieChart: any;
  topSanPhamData: TopSanPhamResponse[] = [];
  page: number = 0;
  size: number = 3;
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  months: { value: number, label: string }[] = [
    { value: 0, label: 'Chọn tháng' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: `Tháng ${i + 1}`
    }))
  ];
  
  years: number[] = [];
  topProductMonth: number = new Date().getMonth() + 1;
  topProductYear: number = new Date().getFullYear();
  isMonthDisabled: boolean = true;

  constructor(private thongKeService: ThongKeService) { }

  ngOnInit(): void {
    this.isMonthDisabled = true;
    this.loadThongKe(this.selectedType);
    this.loadTopSanPhamThangNay();
    this.onMonthChange()
  }

  loadThongKe(type: string): void {
    this.loadBieuDoNam()
    this.selectedType = type;
    this.thongKeData = null;
    this.destroyChart();

    // 👉 Đặt lại tháng và năm hiện tại
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Nếu là "Hôm nay" hoặc "Tất cả" thì reset giá trị và cập nhật vào combobox
    if (type === 'Hôm nay' || type === 'Tất cả') {
      this.selectedMonth = currentMonth;
      this.selectedYear = currentYear;
    }

    // Gọi API tương ứng
    if (type === 'Hôm nay') {
      this.thongKeService.thongKeTongQuan(type).subscribe(data => {
        this.thongKeData = data;
        this.loadBieuDoHomNay();
      });
    } else if (type === 'Tất cả') {
      this.thongKeService.thongKeTongQuan(type).subscribe(data => {
        this.thongKeData = data;
        this.loadBieuDoNam();
      });
    } else {
      // Nếu là "Theo tháng/năm" thì load theo tháng
      this.onMonthChange();
    }
  }

  onMonthChange(): void {
    this.selectedType = '';
    if (this.selectedType === 'Hôm nay' || this.selectedMonth === 0) {
      this.destroyChart();
      return;
    }

    // Gọi dữ liệu tổng quan theo tháng và năm
    this.thongKeService.getThongKeTongQuan(this.selectedMonth, this.selectedYear).subscribe(
      (data: ThongKeResponse) => {
        this.thongKeData = data;
      },
      (error) => {
        console.error('Lỗi khi lấy thống kê tổng quan theo tháng và năm:', error);
      }
    );

    // Gọi dữ liệu biểu đồ doanh thu từng ngày
    this.thongKeService.thongKeTungNgayTrongThang(this.selectedMonth, this.selectedYear).subscribe(
      (data: ThongKeThangNayResponse[]) => {
        if (!data || data.length === 0 || !data.some(item => item.tongDoanhThu > 0)) {
          this.destroyChart();
          return;
        }
        const labels = data.map((item) => `Ngày ${item.ngay}`);
        const values = data.map((item) => item.tongDoanhThu);
        this.renderChart(labels, values, 'Doanh thu từng ngày trong tháng');
      },
      (error) => {
        
        this.thongKeData = {
          soHoaDon: 0,
          tongDoanhThu: 0,
          soKhachHang: 0
        };
        console.log("tk",this.thongKeData)
        this.destroyChart();
        console.error('Lỗi khi lấy dữ liệu doanh thu ngày trong tháng:', error);
      }
    );
  }


  onYearChange(): void {
    this.selectedType = '';
    this.selectedMonth = 0; 
    this.isMonthDisabled = false;
    this.thongKeService.thongKeTungThangNam(this.selectedYear).subscribe(
      (data: ThongKeThangResponse[]) => {
        console.log(data)
        if (!data || data.length === 0 || !data.some(item => item.tongDoanhThu > 0)) {
          console.log('Không có dữ liệu doanh thu theo tháng.');
          this.destroyChart();
          return;
        }
        const labels: string[] = [];
        const values: number[] = new Array(12).fill(0); // Mặc định 12 tháng có giá trị 0

        data.forEach((item) => {
          values[item.thang - 1] = item.tongDoanhThu; // Gán doanh thu vào đúng tháng
        });

        for (let i = 1; i <= 12; i++) {
          labels.push(`Tháng ${i}`);
        }

        this.renderChart(labels, values, 'Doanh thu từng tháng');
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu từng tháng:', error);
      }
    );

    // Lấy thống kê tổng quan theo tháng 1 và năm mới chọn (tùy nhu cầu)
    this.thongKeService.getThongKeTongQuan(0, this.selectedYear).subscribe(
      (data: ThongKeResponse) => {
        this.thongKeData = data;
        console.log("năm", this.thongKeData)
      },
      (error) => {
        console.error('Lỗi khi lấy thống kê tổng quan theo năm:', error);
      }
    );

  }

  // Biểu đồ doanh thu hôm nay
  loadBieuDoHomNay(): void {
    this.thongKeService.thongKeHomNay().subscribe(
      (data: ThongKeHomNayResponse) => {
        // Kiểm tra nếu dữ liệu rỗng hoặc doanh thu là 0 thì ẩn biểu đồ
        if (!data || data.tongDoanhThu === 0) {
          console.log('Không có doanh thu hôm nay, xóa biểu đồ.');
          this.destroyChart();
          return;
        }

        const labels = ['Ngày hôm nay'];
        const values = [data.tongDoanhThu];

        this.renderChart(labels, values, 'Doanh thu hôm nay');
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu doanh thu hôm nay:', error);
      }
    );
  }


  // Biểu đồ doanh thu theo năm
  loadBieuDoNam(): void {
    this.thongKeService.thongKeTungNam().subscribe(
      (data: ThongKeThangResponse[]) => {
        if (!data || data.length === 0 || !data.some(item => item.tongDoanhThu > 0)) {
          console.log('Không có dữ liệu doanh thu theo năm.');
          this.destroyChart();
          return;
        }
        const labels = data.map((item) => `Năm ${item.thang}`);
        const values = data.map((item) => item.tongDoanhThu);
        // Cập nhật danh sách năm (các năm có dữ liệu)
        this.years = Array.from(new Set(data.map(item => item.thang)));
        this.renderChart(labels, values, 'Doanh thu từng năm');
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu từng năm:', error);
      }
    );
  }

  // Vẽ biểu đồ cột
  renderChart(labels: string[], data: number[], label: string): void {
    this.destroyChart();

    // Kiểm tra nếu tất cả giá trị trong `data` đều là 0 thì không vẽ biểu đồ
    if (!data.some(value => value > 0)) {
      console.log('Không có dữ liệu hợp lệ để hiển thị biểu đồ.');
      return;
    }

    const ctx = document.getElementById('chart') as HTMLCanvasElement;
    if (!ctx) {
      console.warn('Không tìm thấy phần tử canvas cho biểu đồ.');
      return;
    }

    this.chart = new Chart(ctx, {
      type: 'bar', // Biểu đồ cột
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)', // Màu xanh dương
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true, // Luôn bắt đầu từ 0
          },
        },
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });
  }

  // Xóa biểu đồ cũ trước khi vẽ mới
  destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
  // Tải danh sách top sản phẩm bán chạy hôm nay
  loadTopSanPhamHomNay(): void {
    // Reset tháng và năm về hiện tại
    this.topProductMonth = new Date().getMonth() + 1;
    this.topProductYear = new Date().getFullYear();
    this.thongKeService.topSanPhamHomNay(this.page, this.size).subscribe(
      (data: TopSanPhamResponse[]) => {
        this.topSanPhamData = data;
        this.renderPieChart();
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách top sản phẩm hôm nay:', error);
      }
    );
  }
  // Tải danh sách top sản phẩm bán chạy trong tháng này
  loadTopSanPhamThangNay(): void {
    this.thongKeService.topSanPhamTheoThangVaNam(this.topProductMonth, this.topProductYear, this.page, this.size).subscribe(
      (data: TopSanPhamResponse[]) => {
        this.topSanPhamData = data;
        this.renderPieChart();
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách top sản phẩm tháng này:', error);
      }
    );
  }

  // Tải danh sách top sản phẩm bán chạy trong năm nay
  loadTopSanPhamNamNay(): void {
    this.topProductMonth=0
    this.thongKeService.topSanPhamTheoNam(this.topProductYear, this.page, this.size).subscribe(
      (data: TopSanPhamResponse[]) => {
        this.topSanPhamData = data;
        this.renderPieChart();
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách top sản phẩm năm nay:', error);
      }
    );
  }

  // Tải danh sách top sản phẩm bán chạy tất cả thời gian
  loadTopSanPhamTatCa(): void {
    // Reset tháng và năm về hiện tại
    this.topProductMonth = new Date().getMonth() + 1;
    this.topProductYear = new Date().getFullYear();
    this.thongKeService.topSanPhamTatCa(this.page, this.size).subscribe(
      (data: TopSanPhamResponse[]) => {
        this.topSanPhamData = data;
        this.renderPieChart();
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách top sản phẩm tất cả thời gian:', error);
      }
    );
  }
  renderPieChart(): void {
    if (typeof document === 'undefined') {
      console.warn('Không thể vẽ biểu đồ vì document không tồn tại.');
      return;
    }

    const topProducts = this.topSanPhamData.slice(0, 5); // Lấy 5 sản phẩm đầu tiên
    const otherProducts = this.topSanPhamData.slice(5);  // Tất cả sản phẩm còn lại

    const labels = topProducts.map(product => product.tenSanPham);
    const data = topProducts.map(product => product.tongSoLuong);

    // Kiểm tra nếu có sản phẩm còn lại thì mới thêm vào biểu đồ
    if (otherProducts.length > 0) {
      labels.push('Các sản phẩm khác');
      data.push(otherProducts.reduce((sum, product) => sum + product.tongSoLuong, 0));
    }


    // Kiểm tra canvas tồn tại
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('Không tìm thấy phần tử canvas cho biểu đồ tròn.');
      return;
    }

    // Xóa biểu đồ cũ trước khi vẽ mới
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    // Vẽ biểu đồ tròn
    this.pieChart = new Chart(canvas.getContext('2d')!, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Top sản phẩm bán chạy',
            data: data,
            backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FFD733', '#33FFF5'],
            borderColor: ['#C70039', '#28A745', '#1F3C88', '#C71585', '#E6B800', '#00CED1'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw;
                return `${label}: ${value} sản phẩm`;
              },
            },
          },
        },
      },
    });
  }
}
