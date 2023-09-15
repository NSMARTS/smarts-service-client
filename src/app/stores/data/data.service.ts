import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // getMeetingList(arg0: { spaceId: any; }) {
  //   throw new Error('Method not implemented.');
  // }
  private userProfileSubject = new BehaviorSubject({});
  userProfile = this.userProfileSubject.asObservable();

  private userManagerProfileSubject = new BehaviorSubject({});
  userManagerProfile = this.userManagerProfileSubject.asObservable();

  private userCompanyProfileSubject = new BehaviorSubject({});
  userCompanyProfile = this.userCompanyProfileSubject.asObservable();

  private userNsAdminProfileSubject = new BehaviorSubject({});
  userNsAdminProfile = this.userNsAdminProfileSubject.asObservable();

  constructor() {}

  updateUserProfile(profileData: any) {
    // console.log('updatedData', profileData);
    this.userProfileSubject.next(profileData);
  }

  updateUserManagerProfile(profileData: any) {
    // console.log('updatedData', profileData);
    this.userManagerProfileSubject.next(profileData);
  }

  updateUserCompanyProfile(profileData: any) {
    // console.log('updatedData', profileData);
    this.userCompanyProfileSubject.next(profileData);
  }
}
