export interface Country {
    _id: string,
    countryName: string, // 한국
    countryCode: string, // KR
    countryHoliday: CountryHoliday,
}

interface CountryHoliday {
    holidayName: String,
    holidayDate: String // "YYYY-MM-DD"
}