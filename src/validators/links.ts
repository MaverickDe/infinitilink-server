import { z } from "zod";
import { Types } from "mongoose";
import { E_LINK_CATEGORIES, E_LINK_DOMAIN_TYPE } from "../models/links";
import { convertEnumToList } from "../utils/utils";

const objectId = z.string().refine((val) => {

  
  return Types.ObjectId.isValid(val)
}, {
  message: "Invalid Id"
});

export const createNodeValidator = z.object({
  title: z.string().min(1, "Node name is required").trim(),
    description: z.string().min(1).trim().optional(),
  // user: objectId,
   node: objectId,
     isAnchor: z.boolean().optional(),
     
  anchor: objectId.optional().nullable()
}).refine((data) => {
  if (data.isAnchor && !data.anchor) return false;
  return true;
}, {
  message: "anchor is required when isAnchor is true",
  path: ["anchor"]
});

export const updateNodeValidator = z.object({



    title: z.string().min(1).trim().optional(),
    nodesIsVisible: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    description: z.string().min(1).trim().optional(),
  username: z
  .string()
  .min(1).max(30,"Username cannot be more than 30")
  .trim()
  .regex(/^\S+$/, "Username cannot contain spaces")
  .optional(),
  // user: objectId,
  isFeatured: z.boolean().optional().nullable(),
   node: objectId,
     isAnchor: z.boolean().optional().nullable(),
  anchor: objectId.optional().nullable()
}).refine((data) => {
  if (data.isAnchor && !data.anchor) return false;
  return true;
}, {
  message: "anchor is required when isAnchor is true",
  path: ["anchor"]
});

export const createLinkValidator = z
  .object({
    title: z.string().min(1, "Title is required").trim(),

    url: z.string().url("Invalid URL").optional().nullable(), // 👈 make optional
isFeatured: z.boolean().optional().nullable(),
    isAnchor: z.boolean().optional().default(false),
    anchor: objectId.optional(),

    description: z.string().optional().default(""),
    category: z.enum(convertEnumToList(E_LINK_CATEGORIES)).optional(),
    linkDomainType: z.enum(convertEnumToList(E_LINK_DOMAIN_TYPE)).optional().default(E_LINK_DOMAIN_TYPE.other),
    tags: z.array(z.string().trim().toLowerCase()).optional().default([]),

    node: objectId,
    group: objectId.optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // ✅ Case 1: Anchor link
    if (data.isAnchor) {
      if (!data.anchor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "anchor is required when isAnchor is true",
          path: ["anchor"],
        });
      }
    }

    // ✅ Case 2: Normal link
    if (!data.isAnchor) {
      
      if (!data.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL is required when not an anchor",
          path: ["url"],
        });
      }

 
    }

         if (data.isFeatured) {
          if (data.isAnchor) {


            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "an anchored link can not be featured",
              path: ["isAnchor"],
            });
          }
          if (data.group && data.group!="") {


            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "an group link can not be featured",
              path: ["group"],
            });
          }
      }
  });
export const LinkValidator = z.object({
  title: z.string().min(1, "Title is required").trim(),
  url: z.string().url("Invalid URL").optional().nullable(),
  description: z.string().optional().default(""),
  category: z.enum(convertEnumToList( E_LINK_CATEGORIES)).optional(),
  tags: z.array(z.string().trim().toLowerCase()).optional().default([]),



  isAnchor: z.boolean().optional().default(false),
  anchor: objectId.optional()
})
  .superRefine((data, ctx) => {
    // ✅ Case 1: Anchor link
    if (data.isAnchor) {
      if (!data.anchor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "anchor is required when isAnchor is true",
          path: ["anchor"],
        });
      }
    }

    // ✅ Case 2: Normal link
    if (!data.isAnchor) {
      if (!data.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL is required when not an anchor",
          path: ["url"],
        });
      }
    }
  });

export const updateLinkValidator = z.object({
  linkId: objectId,
//   userId: objectId,

  title: z.string().min(1).trim().optional(),
  url: z.string().url().optional().nullable(),
  description: z.string().optional(),
  tags: z.array(z.string().trim().toLowerCase()).optional(),
  category: z.enum(convertEnumToList( E_LINK_CATEGORIES)).optional(),

  isAnchor: z.boolean().optional().nullable(),
  isFeatured: z.boolean().optional().nullable(),
  anchor: objectId.optional().nullable(),
  group: objectId.optional().nullable()
})
  .superRefine((data, ctx) => {
    // ✅ Case 1: Anchor link
    if (data.isAnchor) {
      if (!data.anchor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "anchor is required when isAnchor is true",
          path: ["anchor"],
        });
      }
    }

    // ✅ Case 2: Normal link
    if (!data.isAnchor) {
      if (!data.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL is required when not an anchor",
          path: ["url"],
        });
      }
    }

          if (data.isFeatured) {
          if (data.isAnchor) {


            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "an anchored link can not be featured",
              path: ["isAnchor"],
            });
          }
          if (data.group && data.group!="") {


            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "an group link can not be featured",
              path: ["group"],
            });
          }
      }

    
  });

export const searchLinkValidator = z.object({
  // userId: objectId.optional(),

  query: z.string().min(1, "Search query is required").optional(),

page: z.coerce.number().int().positive().optional().default(1),
  category:z.string().min(1, "category is required").optional().nullable(),
  sort:z.string().optional().nullable()
  // limit: z.number().int().positive().max(30).optional().default(30)
});





export const createLinkGroupValidator = z.object({
  title: z.string().min(1).trim(),
  description: z.string().optional().default(""),
  node: objectId,
//   user: objectId,
  ishidden: z.boolean().optional().default(false),
  link:LinkValidator
});


export const updateLinkGroupValidator = z.object({
  id: objectId,
//   userId: objectId,
  title: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  ishidden: z.boolean().optional(),
  isVisibleInNode: z.boolean().optional()
});