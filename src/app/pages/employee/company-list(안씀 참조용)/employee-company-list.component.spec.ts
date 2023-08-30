import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCompanyListComponent } from './employee-company-list.component';

describe('CompanyListComponent', () => {
    let component: EmployeeCompanyListComponent;
    let fixture: ComponentFixture<EmployeeCompanyListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [EmployeeCompanyListComponent]
        });
        fixture = TestBed.createComponent(EmployeeCompanyListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
