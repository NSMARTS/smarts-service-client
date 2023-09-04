import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';
import { DialogService } from 'src/app/services/dialog.service';
import { ManagerService } from 'src/app/services/manager.service';
import { Manager } from 'src/app/interfaces/manager.interface';

@Component({
  selector: 'app-manager-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './manager-list.component.html',
  styleUrls: ['./manager-list.component.scss'],
})
export class ManagerListComponent {
  displayedColumns: string[] = [
    'name',
    'email',
    'phone',
    'address',
    'superManager',
    'btns',
  ];
  companyId: any;

  dataSource: MatTableDataSource<Manager> = new MatTableDataSource<Manager>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private managerService: ManagerService,
    public dialogService: DialogService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.getManagerList();
  }

  // 회사 목록 조회
  getManagerList() {
    this.managerService.getManagerList(this.companyId).subscribe({
      next: (res: HttpResMsg<Manager[]>) => {
        const manager = res.data;
        this.dataSource = new MatTableDataSource(manager);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('No companies found');
        } else {
          console.error('An error occurred while fetching manager list');
        }
      },
    });
  }

  // 회사 등록
  addManager() {
    this.router.navigate(['company/' + this.companyId + '/manager/add']);
  }

  //회사 수정
  editManager(managerId: any) {
    this.router.navigate([
      'company/' + this.companyId + '/manager/edit/' + managerId,
    ]);
  }

  // // 회사 삭제
  deleteManager(managerId: any) {
    this.dialogService
      .openDialogConfirm('Do you delete this manager?')
      .subscribe((result: any) => {
        if (result) {
          this.managerService.deleteManager(managerId).subscribe({
            next: () => {
              this.dialogService.openDialogPositive(
                'Successfully, the manager has been delete.'
              );
              this.getManagerList();
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
