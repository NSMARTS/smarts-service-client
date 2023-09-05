import {
  Component,
  ElementRef,
  ViewChild,
  WritableSignal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Employee } from 'src/app/interfaces/employee.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MatDialog } from '@angular/material/dialog';
import { PayStubDialogComponent } from 'src/app/dialog/pay-stub-dialog/pay-stub-dialog.component';
import { PayStubService } from 'src/app/services/pay-stub.service';
import { SelectionModel } from '@angular/cdk/collections';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/lib/build/pdf.worker.js';

@Component({
  selector: 'app-pay-stub-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './pay-stub-list.component.html',
  styleUrls: ['./pay-stub-list.component.scss'],
})
export class PayStubListComponent {
  selection = new SelectionModel<any>(false, []);
  imgSrc: string = '';
  displayedColumns: string[] = [
    'select',
    'employee',
    'title',
    'uploadDate',
    'location',
  ];

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>(
    []
  );
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  companyId: string; // 회사아이디 params

  filterValues: any = {};
  filterSelectObj: any = [];
  company_max_day: any;
  isRollover = false;
  employees: WritableSignal<Employee[]>;
  paystubs: WritableSignal<any[]>;

  @ViewChild('pdfViewer') pdfViewer!: ElementRef<HTMLCanvasElement>;

  constructor(
    private employeeService: EmployeeService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private payStubService: PayStubService
  ) {
    this.companyId = this.route.snapshot.params['id'];
    // 상태저장된 employee 리스트 불러오기
    this.employees = this.employeeService.employees;
    // 상태저장된 payStubs 리스트 불러오기
    this.paystubs = this.payStubService.payStubs;
  }
  ngOnInit(): void {
    this.getEmployees(this.companyId);
    this.getPayStubs(this.companyId);
  }

  async getEmployees(companyId: string) {
    // lastValueFrom은 rxjs 비동기 통신을하기위 사용
    // 서버에 값을 받아올때까지 멈춘다.
    const employees = await lastValueFrom(
      this.employeeService.getEmployees(companyId)
    );
    // signal을 통한 상태관리
    await this.employeeService.setEmployees(employees.data);
  }

  async getPayStubs(companyId: string) {
    const paystubs = await lastValueFrom(
      this.payStubService.getPayStubs(companyId)
    );
    await this.payStubService.setPayStubs(paystubs.data);
    console.log(this.paystubs());

    this.dataSource = new MatTableDataSource(this.payStubService.payStubs());
    this.dataSource.paginator = this.paginator;
  }

  onRowClick(row: any) {
    this.selection.clear();
    this.selection.select(row);
    this.imgSrc = row?.location;
    this.getPdf(row?.key);
  }

  getPdf(url: string) {
    this.payStubService.getPdf(url).subscribe({
      next: async (res: ArrayBuffer) => {
        const loadingTask = pdfjsLib.getDocument({ data: res });

        loadingTask.promise.then((pdfDocument) => {
          // Assuming you want to render the first page
          pdfDocument.getPage(1).then((page) => {
            const viewport = page.getViewport({ scale: 1 });
            const context = this.pdfViewer.nativeElement.getContext('2d');

            this.pdfViewer.nativeElement.width = viewport.width;
            this.pdfViewer.nativeElement.height = viewport.height;

            const renderContext = {
              canvasContext: context!,
              viewport: viewport,
            };
            page.render(renderContext);
          });
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  openDialog() {
    this.dialog.open(PayStubDialogComponent, {
      width: '1200px',
      height: '700px',
      data: {
        companyId: this.companyId,
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
