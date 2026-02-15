<script setup lang="ts">
/**
 * Component: Multiple Steps
 *
 * @file ./app/pages/contact/multiple-steps/index.vue
 * @description Career application form component with VeeValidate and Zod
 */

import { Field, ErrorMessage, useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";

// Zod Schema
const formSchema = z.object({
    name: z.string().min(1, "Full name is required"),
    furigana: z.string().min(1, "Furigana is required"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    phone: z.string().min(1, "Phone number is required"),
    birthYear: z.string().min(1, "Year is required").regex(/^\d{4}$/, "Please enter a valid year (4 digits)"),
    birthMonth: z.string().min(1, "Month is required").regex(/^(0?[1-9]|1[0-2])$/, "Please enter a valid month (1-12)"),
    birthDay: z.string().min(1, "Day is required").regex(/^(0?[1-9]|[12][0-9]|3[01])$/, "Please enter a valid day (1-31)"),
    qualifications: z.array(z.string()).min(1, "Please select at least one qualification"),
    otherQualification: z.string().optional(),
    privacyAgreed: z.boolean().refine((val) => val === true, {
        message: "You must agree to the privacy policy",
    }),
}).refine(
    (data) => {
        if (data.qualifications.includes("Other") && !data.otherQualification?.trim()) {
            return false;
        }
        return true;
    },
    {
        message: "Please enter your other qualification",
        path: ["otherQualification"],
    }
);

type FormValues = z.infer<typeof formSchema>;

const step = ref<"input" | "confirm" | "complete">("input");
const targetSection = ref<HTMLElement | null>(null);

// VeeValidate Form
const { handleSubmit, values, setFieldValue, validate } = useForm<FormValues>({
    validationSchema: toTypedSchema(formSchema),
    initialValues: {
        name: "",
        furigana: "",
        email: "",
        phone: "",
        birthYear: "",
        birthMonth: "",
        birthDay: "",
        qualifications: [],
        otherQualification: "",
        privacyAgreed: false,
    },
});

const currentStepIndex = computed(() => {
    if (step.value === "input") return 0;
    if (step.value === "confirm") return 1;
    return 2;
});

const qualifications = [
    "Doctor",
    "Registered Nurse",
    "Licensed Practical Nurse",
    "Physical Therapist",
    "Occupational Therapist",
    "Speech Therapist",
    "Nutritionist",
    "Registered Dietitian",
    "Care Manager",
    "Social Worker",
    "Certified Care Worker",
    "Orthoptist",
    "Clinical Engineer",
    "Other",
];

const toggleQualification = (qualification: string, checked: boolean) => {
    const current = (values.qualifications as string[]) || [];
    if (checked) {
        setFieldValue("qualifications", [...current, qualification]);
    } else {
        setFieldValue("qualifications", current.filter((q) => q !== qualification));
    }
};

const showOtherQualification = computed(() =>
    (values.qualifications as string[])?.includes("Other")
);

// Go to Confirm - validate first
const goToConfirm = async () => {
    const { valid } = await validate();
    if (valid) {
        step.value = "confirm";
    }
};

const returnInput = () => {
    step.value = "input";
};

const goToHome = () => {
    navigateTo("/");
};

// Submit Form
const submitForm = handleSubmit(async (formValues) => {
    try {
        // Format birthday
        const birthday = `${formValues.birthYear}-${formValues.birthMonth.padStart(2, "0")}-${formValues.birthDay.padStart(2, "0")}`;

        // Submit to API
        await $fetch("/api/contact", {
            method: "POST",
            body: {
                name: formValues.name,
                furigana: formValues.furigana,
                email: formValues.email,
                phone: formValues.phone,
                birthday,
                qualifications: formValues.qualifications,
                otherQualification: formValues.otherQualification || "",
                preferredWorkArea: "", // Not in current form, but required by API
                jobTitle: "[Nurse] Opening July 2025 - Soka City Nakane - Full-time Position",
            },
        });

        step.value = "complete";
    } catch (error) {
        console.error("[Form submission error]", error);
        // You can add error handling UI here
    }
});

watch(step, () => {
    targetSection.value?.scrollIntoView({ behavior: "smooth" });
});
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8 px-4">
        <div ref="targetSection" class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    <span v-if="step === 'input'">Application Form</span>
                    <span v-if="step === 'confirm'">Confirm</span>
                    <span v-if="step === 'complete'">Complete</span>
                </h1>

                <!-- Step Indicator -->
                <div class="flex items-center gap-4 mb-8">
                    <template v-for="(stepLabel, index) in ['input', 'confirm', 'complete']" :key="stepLabel">
                        <div class="flex items-center">
                            <div :class="[
                                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                                index <= currentStepIndex
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                            ]">
                                {{ index + 1 }}
                            </div>
                            <div v-if="index < 2" :class="[
                                'w-12 h-1 mx-2',
                                index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                            ]" />
                        </div>
                        <div :class="[
                            'text-sm font-medium min-w-[60px]',
                            index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                        ]">
                            <span v-if="stepLabel === 'input'">Input</span>
                            <span v-else-if="stepLabel === 'confirm'">Confirm</span>
                            <span v-else>Complete</span>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Job Title -->
            <div v-if="step === 'input'" class="mb-6 p-4 bg-gray-50 rounded-lg">
                <div class="text-sm font-medium text-gray-700 mb-1">
                    Job Title
                </div>
                <div class="text-base text-gray-900">
                    [Nurse] Opening July 2025 - Soka City Nakane - Full-time Position
                </div>
            </div>

            <!-- Form Content -->
            <form v-if="step === 'input'" @submit="submitForm" class="space-y-6">
                <!-- Name -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Full Name
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <Field name="name" v-slot="{ field, errors }">
                        <input v-bind="field" type="text" placeholder="Enter your full name" :class="[
                            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                            errors.length > 0
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        ]" />
                        <ErrorMessage name="name" class="text-red-500 text-sm mt-1" />
                    </Field>
                </div>

                <!-- Furigana -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Furigana
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <Field name="furigana" v-slot="{ field, errors }">
                        <input v-bind="field" type="text" placeholder="Enter your name in furigana" :class="[
                            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                            errors.length > 0
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        ]" />
                        <ErrorMessage name="furigana" class="text-red-500 text-sm mt-1" />
                    </Field>
                </div>

                <!-- Email -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Email Address
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <p class="text-xs text-gray-600">
                        We recommend using free email addresses (@gmail.com, @yahoo.co.jp, @icloud.com, etc.). Mobile
                        carrier email addresses may not receive emails from us.
                    </p>
                    <Field name="email" v-slot="{ field, errors }">
                        <input v-bind="field" type="email" placeholder="Enter your email address" :class="[
                            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                            errors.length > 0
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        ]" />
                        <ErrorMessage name="email" class="text-red-500 text-sm mt-1" />
                    </Field>
                </div>

                <!-- Phone -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Phone Number
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <Field name="phone" v-slot="{ field, errors }">
                        <input v-bind="field" type="tel" placeholder="Enter your phone number" :class="[
                            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                            errors.length > 0
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        ]" />
                        <ErrorMessage name="phone" class="text-red-500 text-sm mt-1" />
                    </Field>
                </div>

                <!-- Date of Birth -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Date of Birth
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <div class="flex flex-wrap gap-4">
                        <Field name="birthYear" v-slot="{ field, errors }">
                            <div class="flex items-center gap-2">
                                <input v-bind="field" type="text" placeholder="1990" :class="[
                                    'w-20 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                                    errors.length > 0
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                ]" />
                                <span class="text-sm text-gray-700">Year</span>
                            </div>
                            <ErrorMessage name="birthYear" class="text-red-500 text-xs mt-1" />
                        </Field>
                        <Field name="birthMonth" v-slot="{ field, errors }">
                            <div class="flex items-center gap-2">
                                <input v-bind="field" type="text" placeholder="01" :class="[
                                    'w-20 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                                    errors.length > 0
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                ]" />
                                <span class="text-sm text-gray-700">Month</span>
                            </div>
                            <ErrorMessage name="birthMonth" class="text-red-500 text-xs mt-1" />
                        </Field>
                        <Field name="birthDay" v-slot="{ field, errors }">
                            <div class="flex items-center gap-2">
                                <input v-bind="field" type="text" placeholder="01" :class="[
                                    'w-20 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                                    errors.length > 0
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                ]" />
                                <span class="text-sm text-gray-700">Day</span>
                            </div>
                            <ErrorMessage name="birthDay" class="text-red-500 text-xs mt-1" />
                        </Field>
                    </div>
                </div>

                <!-- Qualifications -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Qualifications
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <p class="text-xs text-gray-600">
                        Please check all qualifications you hold.
                    </p>
                    <Field name="qualifications" v-slot="{ field }">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            <label v-for="qualification in qualifications" :key="qualification"
                                class="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                <input type="checkbox"
                                    :checked="(values.qualifications as string[])?.includes(qualification)"
                                    @change="toggleQualification(qualification, ($event.target as HTMLInputElement)?.checked ?? false)"
                                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span class="text-sm text-gray-700">{{ qualification }}</span>
                            </label>
                        </div>
                        <ErrorMessage name="qualifications" class="text-red-500 text-sm mt-1" />
                    </Field>
                </div>

                <!-- Other Qualification -->
                <Field v-if="showOtherQualification" name="otherQualification" v-slot="{ field, errors }">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-700">
                            If you checked "Other", please enter your qualification
                        </label>
                        <input v-bind="field" type="text" placeholder="Enter your other qualification" :class="[
                            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                            errors.length > 0
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        ]" />
                        <ErrorMessage name="otherQualification" class="text-red-500 text-sm mt-1" />
                    </div>
                </Field>

                <!-- Privacy Policy -->
                <Field name="privacyAgreed" v-slot="{ field, errors }">
                    <div class="space-y-2">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" :checked="field.value"
                                @change="field.onChange(($event.target as HTMLInputElement)?.checked ?? false)"
                                @blur="field.onBlur"
                                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span class="text-sm text-gray-700">
                                I agree to the
                                <span class="underline">Privacy Policy</span>
                                and submit
                            </span>
                        </label>
                        <ErrorMessage name="privacyAgreed" class="text-red-500 text-sm mt-1" />
                    </div>
                </Field>

                <!-- Submit Button -->
                <button type="button" @click="goToConfirm" :disabled="!values.privacyAgreed" :class="[
                    'w-full md:w-auto px-6 py-3 rounded-lg font-medium',
                    values.privacyAgreed ? 'text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]">
                    {{ values.privacyAgreed ? 'Submit' : 'Please agree to the privacy policy' }}
                </button>
            </form>

            <!-- Confirm Step -->
            <div v-if="step === 'confirm'" class="space-y-6">
                <div class="text-sm text-red-500">
                    Submission not yet completed.<br />
                    Please check the information you have entered and press the "Information Confirmend and Submit"
                    button at the
                    bottom of the page.
                </div>
                <div class="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                        <div class="text-sm font-medium text-gray-700">Full Name</div>
                        <div class="text-base text-gray-900">{{ values.name }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Furigana</div>
                        <div class="text-base text-gray-900">{{ values.furigana }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Email Address</div>
                        <div class="text-base text-gray-900">{{ values.email }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Phone Number</div>
                        <div class="text-base text-gray-900">{{ values.phone }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="text-sm font-medium text-gray-700">Date of Birth</div>
                        <div class="text-base text-gray-900">{{ values.birthYear }}年{{ values.birthMonth }}月{{
                            values.birthDay }}日</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Qualifications</div>
                        <div class="text-base text-gray-900">{{ (values.qualifications as string[])?.join(", ") }}</div>
                    </div>
                    <div v-if="values.otherQualification">
                        <div class="text-sm font-medium text-gray-700">Other Qualification</div>
                        <div class="text-base text-gray-900">{{ values.otherQualification }}</div>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button type="button" @click="returnInput"
                        class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                        Back to Input
                    </button>
                    <button type="button" @click="submitForm"
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Confirm and Submit
                    </button>
                </div>
            </div>

            <!-- Complete Step -->
            <div v-if="step === 'complete'" class="text-center py-12 space-y-4">
                <div class="text-4xl mb-4">✓</div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                    Complete
                </h2>
                <p class="text-gray-600">Thank you for your application.</p>

                <button type="button" @click="goToHome"
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Go to Home
                </button>
            </div>
        </div>
    </div>
</template>
