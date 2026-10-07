<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Pagination from '@/Components/Admin/Pagination.vue';
import PageHeading from '@/Components/Admin/PageHeading.vue';
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    emailLogs: Object,
});

function formatDate(value) {
    return new Date(value).toLocaleString();
}
</script>

<template>
    <Head title="Email logs" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeading icon="mail" accent="sky" title="Email logs" />
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                <p class="text-sm text-gray-500">
                    Every email this app has sent — invites, password resets, and anything else — newest first.
                </p>

                <div class="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">To</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Subject</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Sent</th>
                                <th class="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="emailLog in emailLogs.data" :key="emailLog.id" class="transition hover:bg-gray-50">
                                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ emailLog.to }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ emailLog.subject }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(emailLog.created_at) }}</td>
                                <td class="px-6 py-4 text-right text-sm">
                                    <Link :href="route('admin.email-logs.show', emailLog.id)" class="text-dare-sky hover:text-dare-navy">
                                        View
                                    </Link>
                                </td>
                            </tr>
                            <tr v-if="emailLogs.data.length === 0">
                                <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500">No emails sent yet.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="emailLogs.data.length > 0" class="flex items-center justify-between">
                    <p class="text-sm text-gray-500">
                        Showing {{ emailLogs.from }}–{{ emailLogs.to }} of {{ emailLogs.total }}
                    </p>
                    <Pagination :links="emailLogs.links" />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
