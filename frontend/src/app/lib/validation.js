    import { z } from "zod";

    const aiubIdRegex = /^\d{2}-\d{5}-\d$/;

    const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, "Full name is required")
        .min(3, "Full name must be at least 3 characters"),

    aiubId: z
        .string()
        .trim()
        .min(1, "AIUB ID is required")
        .regex(aiubIdRegex, "AIUB ID must be in valid format, for example 22-49155-3"),

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Enter a valid email address"),

    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password must not be more than 20 characters"),
    });

    const loginSchema = z.object({
    aiubId: z
        .string()
        .trim()
        .min(1, "AIUB ID is required")
        .regex(aiubIdRegex, "AIUB ID must be in valid format, for example 22-49155-3"),

    password: z.string().min(1, "Password is required"),
    });

    function formatZodErrors(result) {
    const errors = {};

    if (result.success) {
        return errors;
    }

    result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (!errors[fieldName]) {
        errors[fieldName] = issue.message;
        }
    });

    return errors;
    }

    export function validateRegisterForm(formData) {
    const result = registerSchema.safeParse(formData);
    return formatZodErrors(result);
    }

    export function validateLoginForm(formData) {
    const result = loginSchema.safeParse(formData);
    return formatZodErrors(result);
    }

    export function hasValidationErrors(errors) {
    return Object.keys(errors).length > 0;
    }
