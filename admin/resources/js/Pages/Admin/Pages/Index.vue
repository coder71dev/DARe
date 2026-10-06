<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({
    pages: Array,
});

const showCreate = ref(false);
const form = useForm({ slug: '', title: '' });

function createPage() {
    form.post(route('admin.pages.store'), {
        onSuccess: () => {
            form.reset();
            showCreate.value = false;
        },
    });
}
</script>

<template>
    <Head title="Pages" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold leading-tight text-gray-800">Pages</h2>
                <button
                    type="button"
                    class="rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    @click="showCreate = !showCreate"
                >
                    New page
                </button>
            </div>
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                <div v-if="showCreate" class="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                    <form class="flex flex-wrap items-end gap-4" @submit.prevent="createPage">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                v-model="form.title"
                                type="text"
                                class="mt-1 block w-64 rounded-md border-gray-300 shadow-sm"
                            />
                            <p v-if="form.errors.title" class="mt-1 text-sm text-red-600">{{ form.errors.title }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">URL slug</label>
                            <input
                                v-model="form.slug"
                                type="text"
                                placeholder="about-us"
                                class="mt-1 block w-64 rounded-md border-gray-300 shadow-sm"
                            />
                            <p v-if="form.errors.slug" class="mt-1 text-sm text-red-600">{{ form.errors.slug }}</p>
                        </div>
                        <button
                            type="submit"
                            :disabled="form.processing"
                            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            Create
                        </button>
                    </form>
                </div>

                <div class="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                                <th class="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="page in pages" :key="page.id">
                                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ page.title }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">/{{ page.slug }}</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="rounded-full px-2 py-1 text-xs font-medium"
                                        :class="page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                                    >
                                        {{ page.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right text-sm">
                                    <Link :href="route('admin.pages.edit', page.id)" class="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
