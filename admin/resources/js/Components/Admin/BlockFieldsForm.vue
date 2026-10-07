<script setup>
// Renders an edit form for ANY block type from its field schema alone (no
// per-block-type Vue component needed) — the admin equivalent of how
// BlockTypes::fields() drives validation on the server. Reused as-is by the
// Phase 3 live-edit overlay's popover/slide-panel.
import { useForm } from '@inertiajs/vue3';
import ImageUploadField from '@/Components/Admin/ImageUploadField.vue';

const props = defineProps({
    block: Object,
});

const form = useForm({ props: { ...props.block.props } });

function save() {
    form.patch(route('admin.blocks.update', props.block.id), { preserveScroll: true });
}
</script>

<template>
    <form class="space-y-4" @submit.prevent="save">
        <div v-for="(definition, key) in block.fields" :key="key">
            <label class="block text-sm font-medium text-gray-700">{{ definition.label }}</label>

            <textarea
                v-if="definition.type === 'textarea'"
                v-model="form.props[key]"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            <select
                v-else-if="definition.type === 'select'"
                v-model="form.props[key]"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
                <option v-for="(label, value) in definition.options" :key="value" :value="value">{{ label }}</option>
            </select>
            <label v-else-if="definition.type === 'boolean'" class="mt-1 flex items-center gap-2">
                <input v-model="form.props[key]" type="checkbox" class="rounded border-gray-300" />
                <span class="text-sm text-gray-600">Enabled</span>
            </label>
            <ImageUploadField v-else-if="definition.type === 'image'" v-model="form.props[key]" class="mt-1" />
            <input
                v-else
                v-model="form.props[key]"
                :type="definition.type === 'url' ? 'url' : 'text'"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />

            <p v-if="form.errors[`props.${key}`]" class="mt-1 text-sm text-red-600">{{ form.errors[`props.${key}`] }}</p>
        </div>

        <div>
            <button
                type="submit"
                :disabled="form.processing"
                class="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
                Save block
            </button>
            <span v-if="form.recentlySuccessful" class="ml-3 text-sm text-green-600">Saved.</span>
        </div>
    </form>
</template>
