import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { CountryService } from 'src/app/services/country.service';
import { DataService } from 'src/app/stores/data/data.service';
import { CountryAddComponent } from '../../../dialog/country-add/country-add.component';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { DialogService } from 'src/app/services/dialog.service';
import { CountryEditComponent } from 'src/app/dialog/country-edit/country-edit.component';

// view table
export interface PeriodicElement {
  countryName: string;
  countryCode: string;
  holiday: any;
  menu: any;
}

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [
    CommonModule,
    MaterialsModule,
    RouterModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss'],
})
export class CountryListComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  displayedColumns: string[] = ['countryCode', 'countryName', 'openIn', 'menu'];
  countryList: MatTableDataSource<PeriodicElement> =
    new MatTableDataSource<PeriodicElement>([]);
  countryInfo: any;
  company: any;
  manager: any;
  userInfo: any;

  constructor(
    public dataService: DataService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private countryService: CountryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCountryList();
  }

  //  ngOnDestroy 메서드는 컴포넌트가 파괴될 때 호출
  // ngOnDestroy() {
  //   // unsubscribe all subscription
  //   this.unsubscribe$.next(); // 옵저버블에 완료 신호를 보냄
  //   this.unsubscribe$.complete(); // 옵저버블을 완료시킴
  // }

  getCountryList() {
    this.countryService.getCountryList().subscribe({
      next: (res: any) => {
        this.countryList = new MatTableDataSource(res.data);
        this.countryList.paginator = this.paginator;
      },
      error: (err: any) => {
        console.log(err.error.message);
      },
    });
  }

  openAddCountry() {
    const dialogRef = this.dialog.open(CountryAddComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.getCountryList();
    });
  }

  // dialog에 아이디를 보내야함
  editCountry(countryId: any) {
    const dialogRef = this.dialog.open(CountryEditComponent, {
      data: { countryId: countryId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getCountryList();
    });
  }

  selectHoliday(countryId: any) {
    console.log(countryId);
    this.router.navigate(['/country/' + countryId]);
  }

  deleteCountry(_id: any) {
    this.dialogService
      .openDialogConfirm('Do you want delete this country?')
      .subscribe((result: any) => {
        if (result) {
          this.countryService.deleteCountry(_id).subscribe({
            next: (data: any) => {
              this.dialogService.openDialogPositive(
                'Successfully, the country has been delete.'
              );
              this.getCountryList();
            },
            error: (err: any) => {
              this.dialogService.openDialogNegative(err.error.message);
            },
          });
        }
      });
  }

  // 회사 이름 필터
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.countryList.filter = filterValue.trim().toLowerCase();

    if (this.countryList.paginator) {
      this.countryList.paginator.firstPage();
    }
  }
}
