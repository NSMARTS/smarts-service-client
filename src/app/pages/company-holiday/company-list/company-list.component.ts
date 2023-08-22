import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CompanyService } from 'src/app/services/company.service';
import { Company } from 'src/app/interfaces/company.interface';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  //   standalone: true,
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss'],
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
  filterValues: any = {};
  filterSelectObj: any = [];
  company_max_day: any;
  isRollover = false;

  dataSource: MatTableDataSource<Company> = new MatTableDataSource<Company>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private companyService: CompanyService // public dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.getCompanyList();
  }

  /**
   * 컴퍼니 리스트 호출
   */
  getCompanyList() {
    this.companyService.getCompanyList().subscribe({
      next: (res: HttpResMsg<Company[]>) => {
        const company = res.data;
        console.log(company);
        this.dataSource = new MatTableDataSource(company);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => console.error(err),
    });
  }

  backManagerList() {
    this.router.navigate(['company-holiday']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  createCompnayHoliday(id: string) {
    console.log(id);
    this.router.navigate([`company-holiday/${id}`]);
  }
}
