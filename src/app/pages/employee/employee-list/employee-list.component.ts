/**
 * Version: 1.0
 * 파일명: employee-list.component.ts
 * 작성일자: 2023-08-17
 * 작성자: 이정운
 * @See File employee-list.component.ts
 * 설명: employee 목록조회. 우선 회사랑 상관없이 다 조회한다.
 * 수정일자: 2023-08-17
 * 수정자: 이정운
 * 수정내역: employee-list.component.ts 생성
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from 'src/app/services/employee.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { Router, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-employee-list',
    standalone: true,
    imports: [CommonModule, MaterialsModule, RouterModule, MatTableModule],
    templateUrl: './employee-list.component.html',
    styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent {
    displayedColumns: string[] = [
        'username',
        'position',
        'location',
        'annual_leave',
        'sick_leave',
        'replacementday_leave',
        'tenure_today',
    ];
    filterValues = {};
    filterSelectObj = [];

    employeeService = inject(EmployeeService)
    router = inject(Router)

    employees = this.employeeService.employees;
    dataSource = new MatTableDataSource(this.employees());

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    editInfo(id: string) {
        this.router.navigate(['edit', id]);
    }
    createEmployee() {
        this.router.navigate(['employee/add']);
    }
}
