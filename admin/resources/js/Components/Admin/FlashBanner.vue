<script setup>
// Renders the one-off "Saved." / "User removed." style messages that admin
// actions flash via back()->with('status', ...). Shared globally through
// HandleInertiaRequests so every screen under AuthenticatedLayout shows them
// without each page having to declare and render its own `status` prop.
import { computed, ref, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';

const page = usePage();
const message = computed(() => page.props.flash?.status ?? null);
const dismissed = ref(false);

watch(message, () => {
    dismissed.value = false;
});
</script>

<template>
    <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div v-if="message && !dismissed" class="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between gap-3 rounded-lg bg-dare-green/10 px-4 py-3 text-sm font-medium text-green-800 ring-1 ring-inset ring-dare-green/30">
                <div class="flex items-center gap-2">
                    <svg class="h-5 w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ message }}</span>
                </div>
                <button
                    type="button"
                    class="shrink-0 rounded-md p-1 text-green-600 transition hover:bg-dare-green/20 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-dare-green"
                    @click="dismissed = true"
                >
                    <span class="sr-only">Dismiss</span>
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </Transition>
</template>
