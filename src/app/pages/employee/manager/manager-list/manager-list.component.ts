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
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-manager-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './manager-list.component.html',
  styleUrls: ['./manager-list.component.scss'],
})
export class ManagerListComponent {
  displayedColumns: string[] = [
    // 'profile',
    'superManager',
    'name',
    'email',
    'phone',
    'address',
    'menu',
  ];
  companyId: any;

  dataSource: MatTableDataSource<Manager> = new MatTableDataSource<Manager>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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

  // 매니저 목록 조회
  getManagerList() {
    this.managerService.getManagerList(this.companyId).subscribe({
      next: (res: HttpResMsg<Manager[]>) => {
        const manager = res.data;
        this.dataSource = new MatTableDataSource(manager);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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

  // 매니저 등록
  addManager() {
    this.router.navigate(['company/' + this.companyId + '/manager/add']);
  }

  // 매니저 수정
  editManager(managerId: any) {
    this.router.navigate([
      'company/' + this.companyId + '/manager/edit/' + managerId,
    ]);
  }

  // 매니저 관리 수정
  managementManager(managerId: any, managerName: string) {
    console.log(managerId, managerName);
    this.router.navigate(
      ['company/' + this.companyId + '/manager/management/' + managerId],
      {
        queryParams: { name: managerName },
      }
    );
  }

  // 매니저 퇴사
  retireManager(managerId: any) {
    this.dialogService
      .openDialogConfirm('Do you retire this manager?')
      .subscribe((result: any) => {
        if (result) {
          this.managerService.retireManager(managerId).subscribe({
            next: () => {
              this.dialogService.openDialogPositive(
                'Successfully, the manager has been retire.'
              );
              this.getManagerList();
            },
            error: (err: any) => {
              console.error(err);
              if (err.status === 404) {
                this.dialogService.openDialogNegative(
                  'Cannot retire manager with assigned employees'
                );
              } else {
                this.dialogService.openDialogNegative('Internet Server Error');
              }
            },
          });
        }
      });
  }

  // 매니저 이름 필터
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
