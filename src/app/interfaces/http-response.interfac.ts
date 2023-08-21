export interface HttpResMsg<T> {
    success: boolean,
    message: string,
    data: T,
    status: number,
    error?: string
}