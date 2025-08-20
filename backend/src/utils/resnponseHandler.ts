import type { Response } from "express";

export const response = (
  res: Response,
  statusCode: number,
  message: string,
  data = null
) => {
  if (!res) {
    console.error("Response is not defined");
    return;
  }

  const responseObj = {
    status: statusCode < 400 ? "success" : "error",
    message,
    data,
  };

  return res.status(statusCode).json(responseObj);
};
