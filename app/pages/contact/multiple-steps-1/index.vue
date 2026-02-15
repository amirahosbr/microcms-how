<script setup lang="ts">
/**
 * Component: Multiple Steps
 *
 * @file ./app/pages/contact/multiple-steps/index.vue
 * @description Career application form component - UI only
 */

const step = ref<"input" | "confirm" | "complete">("input");

const currentStepIndex = computed(() => {
    if (step.value === "input") return 0;
    if (step.value === "confirm") return 1;
    return 2;
});

const goToConfirm = () => {
    step.value = "confirm";
};

const returnInput = () => {
    step.value = "input";
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
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8 px-4">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    <span v-if="step === 'input'">Application Form v1</span>
                    <span v-else-if="step === 'confirm'">Confirm</span>
                    <span v-else>Complete</span>
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
            <div v-if="step === 'input'" class="space-y-6">
                <!-- Name -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Full Name
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <input type="text" placeholder="Enter your full name"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <!-- Furigana -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Furigana
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <input type="text" placeholder="Enter your name in furigana"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                        carrier email
                        addresses may not receive emails from us.
                    </p>
                    <input type="email" placeholder="Enter your email address"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <!-- Phone -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Phone Number
                        <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                            Required
                        </span>
                    </label>
                    <input type="tel" placeholder="Enter your phone number"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                        <div class="flex items-center gap-2">
                            <input type="text" placeholder="1990"
                                class="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <span class="text-sm text-gray-700">Year</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="text" placeholder="01"
                                class="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <span class="text-sm text-gray-700">Month</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="text" placeholder="01"
                                class="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <span class="text-sm text-gray-700">Day</span>
                        </div>
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
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        <label v-for="qualification in qualifications" :key="qualification"
                            class="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input type="checkbox"
                                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span class="text-sm text-gray-700">{{ qualification }}</span>
                        </label>
                    </div>
                </div>

                <!-- Other Qualification -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">
                        If you checked "Other", please enter your qualification
                    </label>
                    <input type="text" placeholder="Enter your other qualification"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <!-- Privacy Policy -->
                <div class="space-y-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="text-sm text-gray-700">
                            I agree to the
                            <span class="underline">Privacy Policy</span>
                            and submit
                        </span>
                    </label>
                </div>

                <!-- Submit Button -->
                <button type="button" @click="goToConfirm"
                    class="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Confirm Input
                </button>
            </div>

            <!-- Confirm Step -->
            <div v-if="step === 'confirm'" class="space-y-6">
                <div class="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                        <div class="text-sm font-medium text-gray-700">Full Name</div>
                        <div class="text-base text-gray-900">John Doe</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Email Address</div>
                        <div class="text-base text-gray-900">john.doe@example.com</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700">Phone Number</div>
                        <div class="text-base text-gray-900">+81 90-1234-5678</div>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button type="button" @click="returnInput"
                        class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                        Back to Input
                    </button>
                    <button type="button" @click="submitForm"
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Submit
                    </button>
                </div>
            </div>

            <!-- Complete Step -->
            <div v-if="step === 'complete'" class="text-center py-12">
                <div class="text-4xl mb-4">✓</div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                    Complete
                </h2>
                <p class="text-gray-600">Thank you for your application.</p>
            </div>
        </div>
    </div>
</template>