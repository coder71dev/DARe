<script setup>
// Disclosure wrapper used across the admin forms/sections (page settings,
// content blocks, diagram elements) so long edit screens can be collapsed
// down to just their titles. Uses v-show rather than v-if for the body so
// an in-progress form's state survives being collapsed and reopened.
import { ref } from 'vue';

const props = defineProps({
    defaultOpen: {
        type: Boolean,
        default: false,
    },
});

const open = ref(props.defaultOpen);
</script>

<template>
    <div>
        <div class="flex items-center justify-between gap-4">
            <button
                type="button"
                class="flex min-w-0 flex-1 items-center gap-2 text-left"
                @click="open = !open"
            >
                <svg
                    class="h-4 w-4 shrink-0 text-gray-400 transition-transform"
                    :class="{ '-rotate-90': !open }"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                    />
                </svg>
                <span class="min-w-0 flex-1"><slot name="title" /></span>
            </button>
            <div class="flex shrink-0 items-center gap-3">
                <slot name="actions" />
            </div>
        </div>
        <div v-show="open" class="mt-4">
            <slot />
        </div>
    </div>
</template>
