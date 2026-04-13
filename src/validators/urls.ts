import { isValidUrl } from "../utils/ssfr";
import { z } from "zod";

export const guardedUrlSchema = z.string().url().refine(
  async (url) => {
    return await isValidUrl(url);
  },
  {
    message: "Invalid or unsafe webhook URL",
  }
);
// export const guardedOptionalUrlSchema = z.string().url().optional().refine(
//   async (url) => {
//     return await isValidUrl(url);
//   },
//   {
//     message: "Invalid or unsafe webhook URL",
//   }
// );


