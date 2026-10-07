<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, usePage } from '@inertiajs/vue3';

defineProps({
    stats: Object,
});

const page = usePage();

const statCards = [
    { label: 'Pages', key: 'pages', icon: 'document', accent: 'sky' },
    { label: 'Published', key: 'publishedPages', icon: 'check', accent: 'green' },
    { label: 'Diagrams', key: 'diagrams', icon: 'chart', accent: 'navy' },
    { label: 'Admin users', key: 'admins', icon: 'users', accent: 'sky' },
];

const accentClasses = {
    sky: 'bg-dare-sky/10 text-dare-sky',
    green: 'bg-dare-green/10 text-green-700',
    navy: 'bg-dare-navy/10 text-dare-navy',
};
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
                    <div
                        v-for="card in statCards"
                        :key="card.key"
                        class="flex items-center gap-4 overflow-hidden rounded-lg bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" :class="accentClasses[card.accent]">
                            <svg v-if="card.icon === 'document'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <svg v-else-if="card.icon === 'check'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <svg v-else-if="card.icon === 'chart'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">{{ card.label }}</p>
                            <p class="mt-0.5 text-2xl font-semibold text-dare-navy">{{ stats[card.key] }}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Quick links</h3>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Link
                            :href="route('admin.pages.index')"
                            class="group flex items-start gap-4 overflow-hidden rounded-lg border border-transparent bg-white p-5 shadow-sm transition hover:border-dare-sky/30 hover:shadow-md"
                        >
                            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dare-sky/10 text-dare-sky">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="font-medium text-gray-900 group-hover:text-dare-navy">Manage pages</p>
                                <p class="mt-1 text-sm text-gray-500">Edit page content, blocks, and publish status.</p>
                            </div>
                            <svg class="mt-2 h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-dare-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </Link>
                        <Link
                            :href="route('admin.diagrams.index')"
                            class="group flex items-start gap-4 overflow-hidden rounded-lg border border-transparent bg-white p-5 shadow-sm transition hover:border-dare-green/40 hover:shadow-md"
                        >
                            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dare-green/10 text-green-700">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="font-medium text-gray-900 group-hover:text-dare-navy">Manage diagrams</p>
                                <p class="mt-1 text-sm text-gray-500">Edit the text shown on each TPRAF diagram.</p>
                            </div>
                            <svg class="mt-2 h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </Link>
                        <Link
                            v-if="page.props.auth.user.is_admin"
                            :href="route('admin.users.index')"
                            class="group flex items-start gap-4 overflow-hidden rounded-lg border border-transparent bg-white p-5 shadow-sm transition hover:border-dare-navy/30 hover:shadow-md"
                        >
                            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dare-navy/10 text-dare-navy">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="font-medium text-gray-900 group-hover:text-dare-navy">Admin users</p>
                                <p class="mt-1 text-sm text-gray-500">Invite another admin or remove access.</p>
                            </div>
                            <svg class="mt-2 h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-dare-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </Link>
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener"
                            class="group flex items-start gap-4 overflow-hidden rounded-lg border border-transparent bg-white p-5 shadow-sm transition hover:border-emerald-400/40 hover:shadow-md"
                        >
                            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="font-medium text-gray-900 group-hover:text-emerald-700">View the public site</p>
                                <p class="mt-1 text-sm text-gray-500">See what visitors see, no edit chrome.</p>
                            </div>
                            <svg class="mt-2 h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
