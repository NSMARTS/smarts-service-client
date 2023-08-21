export interface Employee extends EmployeeTakenVacation {
    _id: string,
    email: string, // 이메일
    username: string, // 사용자 이름
    companyId: string, // 회사 아이디

}

// 사용한 휴가
export interface EmployeeTakenVacation {
    entitlement: number, // 갖고 있던 연차 휴가 갯수
    takenEntiltement: number, // 연차 휴가 사용 횟수
    rollover: number, // 갖고 있던 이월 휴가 갯수
    takenRollover: number, // 이월 휴가 사용 횟수
    replacementDay: number, // 갖고 있던 대체 휴가 갯수
    takenReplacementDay: number, // 대체 휴가 사용 횟수
    contractStartDate: Date, // 계약 시작일
    contractEndDate: Date, // 계약 끝나는 날
    profileImgPath_path: string // 프로필 이미지 경로
}