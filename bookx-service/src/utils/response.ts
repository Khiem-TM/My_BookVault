export interface ApiResponse<T = any> {
    code: number;
    message?: string;
    result?: T;
}

export const successResponse = <T>(data: T, message: string = "Success", code: number = 1000): ApiResponse<T> => {
    return {
        code,
        message,
        result: data
    };
};

export const errorResponse = (message: string, code: number = 9999): ApiResponse => {
    return {
        code,
        message
    };
};

export interface PageResponse<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
}
