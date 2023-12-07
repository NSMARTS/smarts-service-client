import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { Manager } from 'src/app/interfaces/manager.interface';
import { MatDialog } from '@angular/material/dialog';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-retire-manager',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './retire-manager.component.html',
  styleUrls: ['./retire-manager.component.scss'],
})
export class RetiredManagerListComponent {
  displayedColumns: string[] = ['name', 'email', 'phone', 'cancel'];

  dataSource: MatTableDataSource<Manager> = new MatTableDataSource<Manager>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  companyId: string; // 회사아이디 params

  constructor(
    public dialog: MatDialog,
    private managerService: ManagerService,
    private route: ActivatedRoute,
    private dialogService: DialogService
  ) {
    this.companyId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getMyRetireManagers();
  }

  // 퇴사자 목록 출력
  getMyRetireManagers() {
    this.managerService.getRetireManagers(this.companyId).subscribe({
      next: (data: any) => {
        this.dataSource = new MatTableDataSource(data.data);
        this.dataSource.paginator = this.paginator;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  // 퇴사자 퇴사 취소
  cancelRetireManager(managerId: string) {
    this.dialogService
      .openDialogConfirm('Do you want cancel this request?')
      .subscribe((result: any) => {
        if (result) {
          this.managerService.cancelRetireManager(managerId).subscribe({
            next: () => {
              this.getMyRetireManagers();
              this.dialogService.openDialogPositive(
                'Successfully, the employee has been retire cancel.'
              );
            },
            error: (err: any) => {
              console.error(err);
              this.dialogService.openDialogNegative('An error has occurred.');
            },
          });
        }
      });
  }

  // 퇴사자 필터
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
