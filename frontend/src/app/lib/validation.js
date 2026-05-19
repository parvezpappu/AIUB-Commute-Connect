    import { z } from "zod";

    const aiubIdRegex = /^\d{2}-\d{5}-\d$/;
    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
    const isValidDateTime = (value) => {
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
    };

    const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, "Full name is required")
        .min(3, "Full name must be at least 3 characters"),

    aiubId: z
        .string()
        .trim()
        .min(1, "University ID is required")
        .regex(aiubIdRegex, "University ID must be in valid format, for example 22-49155-3"),

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Enter a valid email address"),

    gender: z.enum(["MALE", "FEMALE"], {
        message: "Select your gender",
    }),

    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password must not be more than 20 characters")
        .regex(
        strongPasswordRegex,
        "Password must include a letter, number, and special character",
        ),

    preferredFromLocation: z.string().trim().optional(),

    preferredToLocation: z.string().trim().optional(),
    });

    const loginSchema = z.object({
    aiubId: z
        .string()
        .trim()
        .min(1, "University ID is required")
        .regex(aiubIdRegex, "University ID must be in valid format, for example 22-49155-3"),

    password: z.string().min(1, "Password is required"),
    });

    const changePasswordSchema = z
    .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
        .string()
        .min(1, "New password is required")
        .min(6, "New password must be at least 6 characters")
        .max(20, "New password must not be more than 20 characters")
        .regex(
        strongPasswordRegex,
        "New password must include a letter, number, and special character",
        ),

    confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "New password and confirmation do not match",
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password",
    });

    const createCommuteSchema = z.object({
    transportType: z.enum(["UBER", "BUS", "BIKE", "CNG", "RICKSHAW", "WALKING"], {
        message: "Select a valid transport type",
    }),

    participantGenderPreference: z.enum(["MALE", "FEMALE", "BOTH"], {
        message: "Select who can join this commute",
    }),

    fromLocation: z
        .string()
        .trim()
        .min(1, "From location is required")
        .min(2, "From location must be at least 2 characters"),

    toLocation: z
        .string()
        .trim()
        .min(1, "To location is required")
        .min(2, "To location must be at least 2 characters"),

    meetingLocation: z
        .string()
        .trim()
        .min(1, "Meeting location is required")
        .min(2, "Meeting location must be at least 2 characters"),

    meetingAddress: z.string().trim().optional(),

    meetingLatitude: z
        .number({
        message: "Select the meeting point on the map",
        })
        .min(-90, "Meeting latitude must be valid")
        .max(90, "Meeting latitude must be valid"),

    meetingLongitude: z
        .number({
        message: "Select the meeting point on the map",
        })
        .min(-180, "Meeting longitude must be valid")
        .max(180, "Meeting longitude must be valid"),

    departureTime: z
        .string()
        .min(1, "Departure time is required")
        .refine(isValidDateTime, "Enter a valid departure date and time")
        .refine((value) => new Date(value) > new Date(), "Departure time must be in the future"),

    expiresAt: z
        .string()
        .min(1, "Request close time is required")
        .refine(isValidDateTime, "Enter a valid request close date and time")
        .refine((value) => new Date(value) > new Date(), "Request close time must be in the future"),

    seats: z
        .string()
        .min(1, "Seats are required")
        .refine((value) => Number.isInteger(Number(value)), "Seats must be a whole number")
        .refine((value) => Number(value) >= 1, "Seats must be at least 1")
        .refine((value) => Number(value) <= 10, "Seats must not be more than 10"),

    costPerPerson: z
        .string()
        .optional()
        .default("")
        .refine((value) => Number.isInteger(Number(value)), "Cost must be a whole number")
        .refine((value) => Number(value) >= 0, "Cost must be 0 or more"),
    costToBeDecided: z.boolean().optional(),
    }).refine(
    (data) => data.costToBeDecided || String(data.costPerPerson || "").trim().length > 0,
    {
        path: ["costPerPerson"],
        message: "Cost is required unless it will be decided later",
    },
    ).refine(
    (data) =>
        isValidDateTime(data.expiresAt) &&
        isValidDateTime(data.departureTime) &&
        new Date(data.expiresAt) > new Date(data.departureTime),
    {
        path: ["expiresAt"],
        message: "Request close time must be after departure time",
    },
    );

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

    export function validateChangePasswordForm(formData) {
    const result = changePasswordSchema.safeParse(formData);
    return formatZodErrors(result);
    }

    export function validateCreateCommuteForm(formData) {
    const result = createCommuteSchema.safeParse(formData);
    return formatZodErrors(result);
    }

    export function hasValidationErrors(errors) {
    return Object.keys(errors).length > 0;
    }

