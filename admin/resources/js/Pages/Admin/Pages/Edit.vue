<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import BlockFieldsForm from '@/Components/Admin/BlockFieldsForm.vue';
import CollapsibleSection from '@/Components/Admin/CollapsibleSection.vue';
import ConfirmDialog from '@/Components/Admin/ConfirmDialog.vue';
import PageHeading from '@/Components/Admin/PageHeading.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import SectionForm from '@/Components/Admin/SectionForm.vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    page: Object,
    blocks: Array,
    blockTypeOptions: Array,
});

const pageForm = useForm({
    title: props.page.title,
    slug: props.page.slug,
    meta_title: props.page.meta_title ?? '',
    meta_description: props.page.meta_description ?? '',
    status: props.page.status,
});

function savePage() {
    pageForm.patch(route('admin.pages.update', props.page.id));
}

const newBlockType = ref(props.blockTypeOptions[0]?.key ?? '');

function addBlock() {
    router.post(route('admin.blocks.store', props.page.id), { block_type: newBlockType.value });
}

const confirmingBlockId = ref(null);
const removingBlock = ref(false);

function confirmRemoveBlock(blockId) {
    confirmingBlockId.value = blockId;
}

function cancelRemoveBlock() {
    confirmingBlockId.value = null;
}

function removeBlock() {
    removingBlock.value = true;

    router.delete(route('admin.blocks.destroy', confirmingBlockId.value), {
        onFinish: () => {
            removingBlock.value = false;
            confirmingBlockId.value = null;
        },
    });
}

const draggingId = ref(null);
const dragOverId = ref(null);

function onDragStart(blockId) {
    draggingId.value = blockId;
}

function onDragEnter(blockId) {
    dragOverId.value = blockId;
}

function onDragEnd() {
    draggingId.value = null;
    dragOverId.value = null;
}

function onDrop(targetId) {
    dragOverId.value = null;

    if (draggingId.value === null || draggingId.value === targetId) {
        return;
    }

    const order = props.blocks.map((b) => b.id);
    const fromIndex = order.indexOf(draggingId.value);
    const toIndex = order.indexOf(targetId);
    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, draggingId.value);

    router.post(route('admin.blocks.reorder', props.page.id), { order }, { preserveScroll: true });
    draggingId.value = null;
}
</script>

<template>
    <Head :title="`Edit — ${page.title}`" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeading
                icon="pencil"
                accent="sky"
                :title="`Edit page: ${page.title}`"
                :back="{ href: route('admin.pages.index'), label: 'Pages' }"
            />
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                <div class="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                    <CollapsibleSection>
                        <template #title>
                            <h3 class="text-lg font-medium text-gray-900">Page settings</h3>
                        </template>

                        <form class="grid grid-cols-2 gap-4" @submit.prevent="savePage">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Title</label>
                                <input v-model="pageForm.title" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">URL slug</label>
                                <input v-model="pageForm.slug" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                <p v-if="pageForm.errors.slug" class="mt-1 text-sm text-red-600">{{ pageForm.errors.slug }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">SEO title (optional)</label>
                                <input v-model="pageForm.meta_title" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <select v-model="pageForm.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                            <div class="col-span-2">
                                <label class="block text-sm font-medium text-gray-700">SEO description (optional)</label>
                                <textarea v-model="pageForm.meta_description" rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div class="col-span-2">
                                <PrimaryButton type="submit" :disabled="pageForm.processing" :class="{ 'opacity-50': pageForm.processing }">
                                    Save page settings
                                </PrimaryButton>
                            </div>
                        </form>
                    </CollapsibleSection>
                </div>

                <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-900">Content blocks</h3>

                    <div
                        v-for="block in blocks"
                        :key="block.id"
                        class="overflow-hidden rounded-lg bg-white p-6 shadow-sm ring-2 transition"
                        :class="dragOverId === block.id && draggingId !== block.id ? 'ring-dare-sky' : 'ring-transparent'"
                        draggable="true"
                        @dragstart="onDragStart(block.id)"
                        @dragenter="onDragEnter(block.id)"
                        @dragover.prevent
                        @dragend="onDragEnd"
                        @drop="onDrop(block.id)"
                    >
                        <CollapsibleSection>
                            <template #title>
                                <h4 class="flex items-center font-medium text-gray-900">
                                    <svg aria-hidden="true" class="mr-2 h-4 w-4 shrink-0 cursor-move text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M7 4a1 1 0 11-2 0 1 1 0 012 0zM7 10a1 1 0 11-2 0 1 1 0 012 0zM7 16a1 1 0 11-2 0 1 1 0 012 0zM15 4a1 1 0 11-2 0 1 1 0 012 0zM15 10a1 1 0 11-2 0 1 1 0 012 0zM15 16a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                    {{ block.label }}
                                </h4>
                            </template>
                            <template #actions>
                                <button type="button" class="text-sm text-red-600 hover:text-red-800" @click="confirmRemoveBlock(block.id)">
                                    Remove
                                </button>
                            </template>

                            <BlockFieldsForm :block="block" />

                            <div class="mt-4 border-t pt-3">
                                <CollapsibleSection>
                                    <template #title>
                                        <span class="text-sm text-gray-500">Section background (advanced)</span>
                                    </template>
                                    <p class="text-xs text-gray-400">
                                        Blocks sharing the same background sit together on one coloured band — this is
                                        how, e.g., the "What is TPRAF?" text and its tiles share one green section today.
                                    </p>
                                    <SectionForm :block="block" />
                                </CollapsibleSection>
                            </div>
                        </CollapsibleSection>
                    </div>

                    <p v-if="blocks.length === 0" class="text-sm text-gray-500">No blocks yet — add one below.</p>

                    <div class="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4">
                        <select v-model="newBlockType" class="rounded-md border-gray-300 shadow-sm">
                            <option v-for="option in blockTypeOptions" :key="option.key" :value="option.key">
                                {{ option.label }}
                            </option>
                        </select>
                        <PrimaryButton type="button" @click="addBlock">
                            Add block
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>

        <ConfirmDialog
            :show="confirmingBlockId !== null"
            title="Remove this block?"
            confirm-label="Remove"
            :processing="removingBlock"
            @confirm="removeBlock"
            @cancel="cancelRemoveBlock"
        >
            This removes the block and its content from the page. This can't be undone.
        </ConfirmDialog>
    </AuthenticatedLayout>
</template>
