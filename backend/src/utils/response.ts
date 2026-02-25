import { Response } from "express";

export interface BaseResponseBody {
  Success: boolean;
  Message: string;
  Object: unknown;
  Errors: string[] | null;
}

export interface PaginatedResponseBody extends BaseResponseBody {
  PageNumber: number;
  PageSize: number;
  TotalSize: number;
}

export function sendSuccess(
  res: Response,
  message: string,
  data: unknown = null,
  statusCode = 200
): void {
  const body: BaseResponseBody = {
    Success: true,
    Message: message,
    Object: data,
    Errors: null,
  };
  res.status(statusCode).json(body);
}

export function sendPaginated(
  res: Response,
  message: string,
  list: unknown[],
  pageNumber: number,
  pageSize: number,
  totalSize: number
): void {
  const body: PaginatedResponseBody = {
    Success: true,
    Message: message,
    Object: list,
    PageNumber: pageNumber,
    PageSize: pageSize,
    TotalSize: totalSize,
    Errors: null,
  };
  res.status(200).json(body);
}

export function sendError(
  res: Response,
  message: string,
  errors: string[] | null = null,
  statusCode = 400
): void {
  const body: BaseResponseBody = {
    Success: false,
    Message: message,
    Object: null,
    Errors: errors ?? [message],
  };
  res.status(statusCode).json(body);
}
