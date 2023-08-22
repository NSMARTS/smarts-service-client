import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private baseUrl = environment.apiUrl;
    destroyRef = inject(DestroyRef);
    constructor(private http: HttpClient) { }

    //회사 등록
    addEmployee(companyData: any) {
        return this.http
            .post(this.baseUrl + '/employee/employee', companyData)
            .pipe(takeUntilDestroyed(this.destroyRef));
    }
}
