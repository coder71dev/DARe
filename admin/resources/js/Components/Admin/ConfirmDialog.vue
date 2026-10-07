<script setup>
// Branded stand-in for the browser's native confirm() on destructive admin
// actions (remove user, remove block) — built on the shared Modal so these
// prompts look like part of the app rather than a raw JS popup.
import Modal from '@/Components/Modal.vue';
import SecondaryButton from '@/Components/SecondaryButton.vue';
import DangerButton from '@/Components/DangerButton.vue';

defineProps({
    show: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        required: true,
    },
    confirmLabel: {
        type: String,
        default: 'Remove',
    },
    processing: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
    <Modal :show="show" max-width="md" @close="emit('cancel')">
        <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900">{{ title }}</h2>

            <p class="mt-1 text-sm text-gray-600">
                <slot>This can't be undone.</slot>
            </p>

            <div class="mt-6 flex justify-end gap-3">
                <SecondaryButton @click="emit('cancel')">Cancel</SecondaryButton>
                <DangerButton :disabled="processing" :class="{ 'opacity-50': processing }" @click="emit('confirm')">
                    {{ confirmLabel }}
                </DangerButton>
            </div>
        </div>
    </Modal>
</template>
