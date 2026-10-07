<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageHeading from '@/Components/Admin/PageHeading.vue';
import { Head, Link } from '@inertiajs/vue3';

defineProps({ views: Array });
</script>

<template>
    <Head title="Diagrams" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeading icon="chart" accent="green" title="Diagrams" />
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-4xl sm:px-6 lg:px-8">
                <div class="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <ul class="divide-y divide-gray-200">
                        <li v-for="view in views" :key="view.key" class="flex items-center justify-between px-6 py-4 transition hover:bg-gray-50">
                            <span class="font-medium text-gray-900">{{ view.title }}</span>
                            <span class="space-x-4 text-sm">
                                <a :href="`${route('diagram')}#${view.key}`" target="_blank" rel="noopener" class="text-dare-green hover:text-green-800">View</a>
                                <Link :href="route('admin.diagrams.edit', view.key)" class="text-dare-sky hover:text-dare-navy">
                                    Edit text
                                </Link>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
