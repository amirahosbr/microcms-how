<script setup lang="ts">
/**
 * Page: Contact Dynamic Field
 *
 * @file ./app/pages/contact/dynamic-field/index.vue
 * @description Contact dynamic field page
 * @module ContactDynamicFieldPage
 */

import { z } from 'zod';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(schema),
});

const { value: email, errorMessage: emailError } = useField('email');
const { value: password, errorMessage: passwordError } = useField('password');

const submit = handleSubmit((values) => {
    console.log('✅', values);
});
</script>

<template>
    <form @submit.prevent="submit" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">Contact</h1>

        <div class="mb-4">
            <input v-model="email" placeholder="Email" class="w-full p-2 border border-gray-300 rounded-md" />
            <span class="text-red-500 text-sm">{{ emailError }}</span>
        </div>
        <div class="mb-4">
            <input v-model="password" type="password" placeholder="Password"
                class="w-full p-2 border border-gray-300 rounded-md" />
            <span class="text-red-500 text-sm">{{ passwordError }}</span>
        </div>

        <button class="bg-blue-500 text-white px-4 py-2 rounded-md">Submit</button>
    </form>
</template>