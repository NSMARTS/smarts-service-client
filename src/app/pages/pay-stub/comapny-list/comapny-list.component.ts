import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { Company } from 'src/app/interfaces/company.interface';
import { MatPaginator } from '@angular/material/paginator';
import { Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CompanyService } from 'src/app/services/company.service';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';

@Component({
  selector: 'app-comapny-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './comapny-list.component.html',
  styleUrls: ['./comapny-list.component.scss']
})
export class PayStubComapnyListComponent {
  displayedColumns: string[] = [
    'companyCode',
    'companyName',
    'employees',
    'annualPolicy',
    'isRollover',
    'isReplacementDay',
    'isAdvanceLeave',
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
  ) { }

  ngOnInit(): void {
    this.getCompanyList();
  }

  /**
   * 컴퍼니 리스트 호출
   */
  getCompanyList() {
    this.companyService.findAllWithEmployeesNum().subscribe({
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
    this.router.navigate(['employee']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  selectCompany(companyName: string) {
    this.router.navigate([`pay-stub/${companyName}`]);
  }
}
