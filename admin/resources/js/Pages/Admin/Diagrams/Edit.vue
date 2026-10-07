<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import CollapsibleSection from '@/Components/Admin/CollapsibleSection.vue';
import { Head, useForm } from '@inertiajs/vue3';

const props = defineProps({
    view: Object,
    elements: Array,
});

function formFor(element) {
    return useForm({
        label: element.label ?? '',
        text: element.text ?? '',
        is_placeholder: element.is_placeholder,
        handbook_url: element.handbook_url ?? '',
    });
}

const forms = Object.fromEntries(props.elements.map((element) => [element.id, formFor(element)]));

function save(elementId) {
    forms[elementId].patch(route('admin.elements.update', elementId), { preserveScroll: true });
}
</script>

<template>
    <Head :title="`Edit diagram — ${view.title}`" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="text-xl font-semibold leading-tight text-gray-800">Edit diagram text: {{ view.title }}</h2>
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-4xl space-y-4 sm:px-6 lg:px-8">
                <p class="text-sm text-gray-500">
                    One row per box, label, and heading on this diagram. Positions and colours aren't editable here —
                    only the text visitors read.
                </p>

                <div v-for="element in elements" :key="element.id" class="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                    <CollapsibleSection>
                        <template #title>
                            <h4 class="font-medium text-gray-900">
                                <span class="rounded bg-gray-100 px-2 py-0.5 text-xs uppercase text-gray-500">{{ element.type }}</span>
                                {{ element.element_key }}
                            </h4>
                        </template>

                        <form class="space-y-4" @submit.prevent="save(element.id)">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Label</label>
                                <textarea
                                    v-model="forms[element.id].label"
                                    rows="2"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                                <p class="mt-1 text-xs text-gray-400">A line break here starts a new line in the diagram.</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Popup text</label>
                                <textarea v-model="forms[element.id].text" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Handbook link (optional)</label>
                                <input
                                    v-model="forms[element.id].handbook_url"
                                    type="text"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>
                            <label class="flex items-center gap-2">
                                <input v-model="forms[element.id].is_placeholder" type="checkbox" class="rounded border-gray-300" />
                                <span class="text-sm text-gray-600">Still a placeholder (shows "awaiting text" note)</span>
                            </label>
                            <button
                                type="submit"
                                :disabled="forms[element.id].processing"
                                class="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                            >
                                Save
                            </button>
                            <span v-if="forms[element.id].recentlySuccessful" class="ml-3 text-sm text-green-600">Saved.</span>
                        </form>
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
