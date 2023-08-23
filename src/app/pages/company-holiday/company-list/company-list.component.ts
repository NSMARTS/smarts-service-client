import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CompanyService } from 'src/app/services/company.service';
import { Company } from 'src/app/interfaces/company.interface';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
})
export class CompanyListComponent {
  displayedColumns: string[] = [
    'companyCode',
    'companyName',
    'employees',
    'annualPolicy',
    'isRollover',
    'isReplacementDay',
    'isMinusAnnualLeave',
  ];

  dataSource: MatTableDataSource<Company> = new MatTableDataSource<Company>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private router: Router, private companyService: CompanyService) {}

  ngOnInit(): void {
    this.getCompanyList();
  }

  // 회사 목록 조회
  getCompanyList() {
    this.companyService.getCompanyList().subscribe({
      next: (res: HttpResMsg<Company[]>) => {
        const company = res.data;
        this.dataSource = new MatTableDataSource(company);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('No companies found');
        } else {
          console.error('An error occurred while fetching company list');
        }
      },
    });
  }

  // 회사 클릭하면 라우트 이동
  createCompnayHoliday(id: string) {
    this.router.navigate([`company-holiday/${id}`]);
  }

  // 회사 이름 필터
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
