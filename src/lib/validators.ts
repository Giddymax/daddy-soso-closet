import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createStaffSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  branch_id: z.string().uuid("Select a branch"),
});

export const addProductSchema = z.object({
  name: z.string().min(2, "Product name required"),
  description: z.string().optional(),
  category_id: z.string().uuid("Select a category"),
  price: z.coerce.number().positive("Price must be positive"),
});

export const restockSchema = z.object({
  quantity_added: z.coerce.number().int().positive("Enter a positive quantity"),
  notes: z.string().optional(),
});

export const siteSettingSchema = z.object({
  value: z.string(),
});

export const changePriceSchema = z.object({
  price: z.coerce.number().positive("Price must be positive"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type CreateStaffFormValues = z.infer<typeof createStaffSchema>;
export type AddProductFormValues = z.infer<typeof addProductSchema>;
export type RestockFormValues = z.infer<typeof restockSchema>;
