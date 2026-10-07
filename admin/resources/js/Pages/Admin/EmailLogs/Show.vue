<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageHeading from '@/Components/Admin/PageHeading.vue';
import { Head } from '@inertiajs/vue3';

const props = defineProps({
    emailLog: Object,
});

function formatDate(value) {
    return new Date(value).toLocaleString();
}
</script>

<template>
    <Head :title="`Email — ${emailLog.subject}`" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeading
                icon="mail"
                accent="sky"
                :title="emailLog.subject"
                :back="{ href: route('admin.email-logs.index'), label: 'Email logs' }"
            />
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-4xl space-y-4 sm:px-6 lg:px-8">
                <div class="overflow-hidden rounded-lg bg-white p-6 shadow-sm">
                    <dl class="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                        <div>
                            <dt class="font-medium text-gray-500">To</dt>
                            <dd class="text-gray-900">{{ emailLog.to }}</dd>
                        </div>
                        <div>
                            <dt class="font-medium text-gray-500">Sent</dt>
                            <dd class="text-gray-900">{{ formatDate(emailLog.created_at) }}</dd>
                        </div>
                    </dl>
                </div>

                <div class="overflow-hidden rounded-lg bg-white shadow-sm">
                    <!--
                        The body is this app's own rendered mail HTML (never
                        user input), but it carries a full stylesheet of its
                        own — an iframe keeps that from leaking into the
                        admin layout around it, same reasoning either way.
                        allow-scripts (only) lets the inline mask/reveal
                        toggle App\Support\EmailBodyRedactor adds to a
                        temporary password run, without granting the frame
                        same-origin access, forms, popups, or navigation.
                    -->
                    <iframe
                        :srcdoc="emailLog.body"
                        sandbox="allow-scripts"
                        class="h-[70vh] w-full"
                        title="Email content"
                    />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
