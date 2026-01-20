<script setup lang="ts">
/**
 * Component: Multiple Steps
 *
 * @file ./app/pages/contact/multiple-steps/index.vue
 * @description Career application form component with VeeValidate
 */

import { Field, Form, ErrorMessage } from "vee-validate";

const step = ref<"input" | "confirm" | "complete">("input");

const currentStepIndex = computed(() => {
    if (step.value === "input") return 0;
    if (step.value === "confirm") return 1;
    return 2;
});

const formValues = ref({
    name: "",
    furigana: "",
    email: "",
    phone: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    qualifications: [] as string[],
    otherQualification: "",
    privacyAgreed: false,
});

const goToConfirm = () => {
    step.value = "confirm";
};

const returnInput = () => {
    step.value = "input";
};

const goToHome = () => {
    navigateTo("/");
};

const submitForm = () => {
    step.value = "complete";
};

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
    const current = formValues.value.qualifications || [];
    if (checked) {
        formValues.value.qualifications = [...current, qualification];
    } else {
        formValues.value.qualifications = current.filter((q) => q !== qualification);
    }
};

const showOtherQualification = computed(() =>
    formValues.value.qualifications.includes("Other")
);
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8 px-4">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
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
            <Form v-if="step === 'input'" v-slot="{ values }" @submit="goToConfirm" class="space-y-6">
                <!-- Name -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Full Name
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <Field name="name" v-slot="{ field, errors }" v-model="formValues.name">
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
                    <Field name="furigana" v-slot="{ field, errors }" v-model="formValues.furigana">
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
                    <Field name="email" v-slot="{ field, errors }" v-model="formValues.email">
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
                    <Field name="phone" v-slot="{ field, errors }" v-model="formValues.phone">
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
                        <Field name="birthYear" v-slot="{ field, errors }" v-model="formValues.birthYear">
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
                        <Field name="birthMonth" v-slot="{ field, errors }" v-model="formValues.birthMonth">
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
                        <Field name="birthDay" v-slot="{ field, errors }" v-model="formValues.birthDay">
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
                    <Field name="qualifications" v-slot="{ field }" v-model="formValues.qualifications">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            <label v-for="qualification in qualifications" :key="qualification"
                                class="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                <input type="checkbox" :checked="formValues.qualifications?.includes(qualification)"
                                    @change="toggleQualification(qualification, ($event.target as HTMLInputElement)?.checked ?? false)"
                                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span class="text-sm text-gray-700">{{ qualification }}</span>
                            </label>
                        </div>
                        <ErrorMessage name="qualifications" class="text-red-500 text-sm mt-1" />
                    </Field>
                </div>

                <!-- Other Qualification -->
                <Field v-if="showOtherQualification" name="otherQualification" v-slot="{ field, errors }"
                    v-model="formValues.otherQualification">
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
                <Field name="privacyAgreed" v-slot="{ field, errors }" v-model="formValues.privacyAgreed">
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
                <button type="submit" :disabled="!formValues.privacyAgreed" :class="[
                    'w-full md:w-auto px-6 py-3 rounded-lg font-medium',
                    formValues.privacyAgreed ? 'text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]">
                    {{ formValues.privacyAgreed ? 'Submit' : 'Please agree to the privacy policy' }}
                </button>
            </Form>

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
                        <div class="text-base text-gray-900">{{ formValues.name }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Furigana</div>
                        <div class="text-base text-gray-900">{{ formValues.furigana }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Email Address</div>
                        <div class="text-base text-gray-900">{{ formValues.email }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Phone Number</div>
                        <div class="text-base text-gray-900">{{ formValues.phone }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="text-sm font-medium text-gray-700">Date of Birth</div>
                        <div class="text-base text-gray-900">{{ formValues.birthYear }}年{{ formValues.birthMonth }}月{{
                            formValues.birthDay }}日</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Qualifications</div>
                        <div class="text-base text-gray-900">{{ formValues.qualifications.join(", ") }}</div>
                    </div>
                    <div v-if="formValues.otherQualification">
                        <div class="text-sm font-medium text-gray-700">Other Qualification</div>
                        <div class="text-base text-gray-900">{{ formValues.otherQualification }}</div>
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
