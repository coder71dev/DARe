<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageHeading from '@/Components/Admin/PageHeading.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({
    caseStudies: Array,
});

const showCreate = ref(false);
const form = useForm({ title: '' });

function createCaseStudy() {
    form.post(route('admin.case-studies.store'));
}
</script>

<template>
    <Head title="Case studies" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeading icon="chart" accent="green" title="Case studies">
                <template #actions>
                    <PrimaryButton type="button" @click="showCreate = !showCreate">
                        New case study
                    </PrimaryButton>
                </template>
            </PageHeading>
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                <p class="text-sm text-gray-500">
                    Case-study walkthroughs appear as buttons above the Level 1 Extended diagram, in the order below.
                    Only published ones are shown to visitors.
                </p>

                <div v-if="showCreate" class="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                    <form class="flex flex-wrap items-end gap-4" @submit.prevent="createCaseStudy">
                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="new-case-study-title">Name</label>
                            <input
                                id="new-case-study-title"
                                v-model="form.title"
                                type="text"
                                placeholder="e.g. GB & Freight"
                                class="mt-1 block w-72 rounded-md border-gray-300 shadow-sm"
                            />
                            <p v-if="form.errors.title" class="mt-1 text-sm text-red-600">{{ form.errors.title }}</p>
                        </div>
                        <PrimaryButton :disabled="form.processing">Create and add steps</PrimaryButton>
                    </form>
                </div>

                <div class="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <ul class="divide-y divide-gray-200">
                        <li
                            v-for="caseStudy in caseStudies"
                            :key="caseStudy.id"
                            class="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-gray-50"
                        >
                            <span class="flex min-w-0 items-center gap-3">
                                <span class="font-medium text-gray-900">{{ caseStudy.title }}</span>
                                <span
                                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                                    :class="caseStudy.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                                >
                                    {{ caseStudy.is_published ? 'Published' : 'Draft' }}
                                </span>
                                <span class="text-sm text-gray-500">
                                    {{ caseStudy.step_count }} {{ caseStudy.step_count === 1 ? 'step' : 'steps' }}
                                </span>
                            </span>
                            <Link :href="route('admin.case-studies.edit', caseStudy.id)" class="shrink-0 text-sm text-dare-sky hover:text-dare-navy">
                                Edit
                            </Link>
                        </li>
                        <li v-if="!caseStudies.length" class="px-6 py-4 text-sm text-gray-500">No case studies yet.</li>
                    </ul>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
