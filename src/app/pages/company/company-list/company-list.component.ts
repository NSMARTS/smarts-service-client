import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CompanyService } from 'src/app/services/company.service';
import { Company } from 'src/app/interfaces/company.interface';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';
import { DialogService } from 'src/app/dialog/dialog.service';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
})
export class CompanyListComponent {
  displayedColumns: string[] = [
    'code',
    'name',
    'rollover',
    'rolloverMaxMonth',
    'rolloverMaxDay',
    'btns',
  ];

  dataSource: MatTableDataSource<Company> = new MatTableDataSource<Company>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private companyService: CompanyService,
    public dialogService: DialogService
  ) {}

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
      error: (err) => console.error(err),
    });
  }

  // 회사 등록
  addCompany() {
    this.router.navigate(['company/company-add']);
  }

  // 회사 수정
  editCompany(id: any) {
    this.router.navigate(['company/company-edit/' + id]);
  }

  // 회사 삭제
  deleteCompany(id: any) {
    this.dialogService
      .openDialogConfirm('Do you delete this company?')
      .subscribe((result: any) => {
        if (result) {
          this.companyService.deleteCompany(id).subscribe({
            next: (data: any) => {
              this.dialogService.openDialogPositive(
                'Successfully, the company has been delete.'
              );
              this.getCompanyList();
            },
            error: (err: any) => {
              console.log(err);
              this.dialogService.openDialogNegative(err.error.message);
              alert(err.error.message);
            },
          });
        }
      });
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
