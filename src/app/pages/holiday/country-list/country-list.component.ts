import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { DialogService } from 'src/app/dialog/dialog.service';
import { CountryService } from 'src/app/services/leave/country/country.service';
import { DataService } from 'src/app/stores/data/data.service';
import { CountryAddComponent } from '../country-add/country-add.component';
import { CountryHolidayAddComponent } from '../country-holiday-add/country-holiday-add.component';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { DialogService } from 'src/app/dialog/dialog.service';
import { HttpResMsg } from 'src/app/interfaces/http-response.interfac';

// view table
export interface PeriodicElement {
  countryName: string;
  countryCode: string;
  btns: any;
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
  displayedColumns: string[] = ['countryName', 'countryCode', 'btns'];
  countryList: MatTableDataSource<PeriodicElement> = new MatTableDataSource<PeriodicElement>([]);
  countryInfo: any;
  company: any;
  manager: any;
  userInfo: any;

  constructor(
    public dataService: DataService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.getCountryList();
  }

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

  deleteCountry(_id: any) {
    this.dialogService
      .openDialogConfirm('Do you want delete this country?')
      .subscribe((result: any) => {
        if (result) {
          this.countryService.deleteCountry(_id).subscribe({
            next: (data: any) => {
              this.getCountryList();
            },
            error: (err: any) => {
              this.dialogService.openDialogNegative(err.error.message);
            },
          });
        }
      });
  }

  addCountryHoliday(countryId: any) {
    const dialogRef = this.dialog.open(CountryHolidayAddComponent, {
      data: { countryId: countryId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getCountryList();
    });
  }
}
