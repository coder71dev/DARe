<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, usePage } from '@inertiajs/vue3';

defineProps({
    stats: Object,
});

const page = usePage();
</script>

<template>
    <Head title="Dashboard" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="text-xl font-semibold leading-tight text-gray-800">
                Welcome back, {{ page.props.auth.user.name }}
            </h2>
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">
                <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div class="overflow-hidden rounded-lg bg-white p-5 shadow-sm">
                        <p class="text-sm font-medium text-gray-500">Pages</p>
                        <p class="mt-1 text-3xl font-semibold text-dare-navy">{{ stats.pages }}</p>
                    </div>
                    <div class="overflow-hidden rounded-lg bg-white p-5 shadow-sm">
                        <p class="text-sm font-medium text-gray-500">Published</p>
                        <p class="mt-1 text-3xl font-semibold text-dare-navy">{{ stats.publishedPages }}</p>
                    </div>
                    <div class="overflow-hidden rounded-lg bg-white p-5 shadow-sm">
                        <p class="text-sm font-medium text-gray-500">Diagrams</p>
                        <p class="mt-1 text-3xl font-semibold text-dare-navy">{{ stats.diagrams }}</p>
                    </div>
                    <div class="overflow-hidden rounded-lg bg-white p-5 shadow-sm">
                        <p class="text-sm font-medium text-gray-500">Admin users</p>
                        <p class="mt-1 text-3xl font-semibold text-dare-navy">{{ stats.admins }}</p>
                    </div>
                </div>

                <div>
                    <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Quick links</h3>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Link
                            :href="route('admin.pages.index')"
                            class="group overflow-hidden rounded-lg bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <p class="font-medium text-gray-900 group-hover:text-dare-navy">Manage pages</p>
                            <p class="mt-1 text-sm text-gray-500">Edit page content, blocks, and publish status.</p>
                        </Link>
                        <Link
                            :href="route('admin.diagrams.index')"
                            class="group overflow-hidden rounded-lg bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <p class="font-medium text-gray-900 group-hover:text-dare-navy">Manage diagrams</p>
                            <p class="mt-1 text-sm text-gray-500">Edit the text shown on each TPRAF diagram.</p>
                        </Link>
                        <Link
                            v-if="page.props.auth.user.is_admin"
                            :href="route('admin.users.index')"
                            class="group overflow-hidden rounded-lg bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <p class="font-medium text-gray-900 group-hover:text-dare-navy">Admin users</p>
                            <p class="mt-1 text-sm text-gray-500">Invite another admin or remove access.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
