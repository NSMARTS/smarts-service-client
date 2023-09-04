import { Component, ViewChild, WritableSignal } from '@angular/core';
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
    'employees',
    'managers',
    'superManagers',
    'detail',
    'btns',
  ];

  company: Company[] = [];
  companyId: WritableSignal<String>;

  dataSource: MatTableDataSource<Company> = new MatTableDataSource<Company>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private companyService: CompanyService,
    public dialogService: DialogService
  ) {
    this.companyId = this.companyService.companyId;
  }

  ngOnInit(): void {
    this.getCompanyList();
  }

  // 회사 목록 조회
  getCompanyList() {
    this.companyService.getCompanyListWith().subscribe({
      next: (res: HttpResMsg<Company[]>) => {
        this.company = res.data;
        console.log(this.company);
        this.dataSource = new MatTableDataSource(this.company);
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

  // 회사 등록
  addCompany() {
    this.router.navigate(['company/add']);
  }

  // 회사 입장
  detailCompany(companyId: any) {
    this.companyId.set(companyId);
    this.router.navigate(['company/' + companyId]);
  }

  // 회사 수정
  editCompany(companyId: any) {
    this.router.navigate(['company/edit/' + companyId]);
  }

  // 회사 삭제
  deleteCompany(companyId: any) {
    this.dialogService
      .openDialogConfirm('Do you delete this company?')
      .subscribe((result: any) => {
        if (result) {
          this.companyService.deleteCompany(companyId).subscribe({
            next: () => {
              this.dialogService.openDialogPositive(
                'Successfully, the company has been delete.'
              );
              this.getCompanyList();
            },
            error: (err: any) => {
              console.error(err);
              this.dialogService.openDialogNegative('Loadings Docs Error');
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
