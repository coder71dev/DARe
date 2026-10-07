<script setup>
// Renders Laravel's standard paginator `links` array (prev/numbered/next,
// each already carrying its own url/label/active) — used wherever an admin
// listing is paginate()'d.
import { Link } from '@inertiajs/vue3';

defineProps({
    links: {
        type: Array,
        required: true,
    },
});
</script>

<template>
    <nav v-if="links.length > 3" class="flex flex-wrap items-center gap-1">
        <template v-for="(link, index) in links" :key="index">
            <span
                v-if="!link.url"
                class="inline-flex min-w-[2.25rem] items-center justify-center rounded-md px-2 py-1.5 text-sm text-gray-300"
                v-html="link.label"
            />
            <Link
                v-else
                :href="link.url"
                preserve-scroll
                class="inline-flex min-w-[2.25rem] items-center justify-center rounded-md px-2 py-1.5 text-sm transition"
                :class="
                    link.active
                        ? 'bg-dare-navy text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                "
                v-html="link.label"
            />
        </template>
    </nav>
</template>
