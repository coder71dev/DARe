<script setup>
// A block's background-band assignment — kept separate from BlockFieldsForm
// since it's a layout/grouping concern, not one of the block's own content
// fields (see App\Support\PageRenderer).
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    block: Object,
});

const form = useForm({
    section_class: props.block.section_class ?? '',
    section_id: props.block.section_id ?? '',
});

function save() {
    form.patch(route('admin.blocks.update', props.block.id), { preserveScroll: true });
}
</script>

<template>
    <form class="mt-2 grid grid-cols-2 gap-3" @submit.prevent="save">
        <div>
            <label class="block text-xs font-medium text-gray-600">Background class (e.g. band-mist, band-navy)</label>
            <input v-model="form.section_class" type="text" class="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm" />
        </div>
        <div>
            <label class="block text-xs font-medium text-gray-600">Anchor id (optional, for #links)</label>
            <input v-model="form.section_id" type="text" class="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm" />
        </div>
        <div class="col-span-2">
            <button
                type="submit"
                :disabled="form.processing"
                class="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
                Save section
            </button>
            <span v-if="form.recentlySuccessful" class="ml-2 text-xs text-green-600">Saved.</span>
        </div>
    </form>
</template>
