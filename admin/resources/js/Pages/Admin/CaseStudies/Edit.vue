<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import CollapsibleSection from '@/Components/Admin/CollapsibleSection.vue';
import ConfirmDialog from '@/Components/Admin/ConfirmDialog.vue';
import ImageUploadField from '@/Components/Admin/ImageUploadField.vue';
import PageHeading from '@/Components/Admin/PageHeading.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, router, useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';

const props = defineProps({
    caseStudy: Object,
    boxes: Array,
    diagramUrl: String,
});

function blankStep() {
    return { title: '', text: '', boxes: [], images: [], caption: '' };
}

const form = useForm({
    title: props.caseStudy.title,
    position: props.caseStudy.position,
    is_published: props.caseStudy.is_published,
    intro_text: props.caseStudy.intro_text ?? '',
    steps: (props.caseStudy.steps ?? []).map((step) => ({
        ...blankStep(),
        ...step,
        boxes: [...(step.boxes ?? [])],
        images: (step.images ?? []).map((image) => ({ src: image.src ?? '', alt: image.alt ?? '' })),
    })),
});

const boxLabels = computed(() => Object.fromEntries(props.boxes.map((box) => [box.key, box.label])));

function addStep() {
    form.steps.push(blankStep());
}

function removeStep(index) {
    form.steps.splice(index, 1);
}

function moveStep(index, offset) {
    const target = index + offset;
    if (target < 0 || target >= form.steps.length) {
        return;
    }
    const [step] = form.steps.splice(index, 1);
    form.steps.splice(target, 0, step);
}

function addImage(step) {
    step.images.push({ src: '', alt: '' });
}

function stepError(index, field) {
    const prefix = `steps.${index}.${field}`;
    const key = Object.keys(form.errors).find((name) => name === prefix || name.startsWith(`${prefix}.`));
    return key ? form.errors[key] : '';
}

function save() {
    form.put(route('admin.case-studies.update', props.caseStudy.id), { preserveScroll: true });
}

const confirmingDelete = ref(false);
const deleting = ref(false);

function destroy() {
    deleting.value = true;
    router.delete(route('admin.case-studies.destroy', props.caseStudy.id), {
        onFinish: () => {
            deleting.value = false;
            confirmingDelete.value = false;
        },
    });
}
</script>

<template>
    <Head :title="`Edit case study — ${caseStudy.title}`" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeading
                icon="pencil"
                accent="green"
                :title="`Case study: ${caseStudy.title}`"
                :back="{ href: route('admin.case-studies.index'), label: 'Case studies' }"
            >
                <template #actions>
                    <a :href="diagramUrl" target="_blank" rel="noopener" class="text-sm font-medium text-dare-green hover:text-green-800">
                        View on the diagram
                    </a>
                </template>
            </PageHeading>
        </template>

        <form class="py-12" @submit.prevent="save">
            <div class="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                <div class="space-y-4 overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                    <div class="grid gap-4 sm:grid-cols-[1fr_8rem]">
                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="case-study-title">Name (shown on the button)</label>
                            <input id="case-study-title" v-model="form.title" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            <p v-if="form.errors.title" class="mt-1 text-sm text-red-600">{{ form.errors.title }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="case-study-position">Order</label>
                            <input id="case-study-position" v-model.number="form.position" type="number" min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            <p v-if="form.errors.position" class="mt-1 text-sm text-red-600">{{ form.errors.position }}</p>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="case-study-intro">Introduction (optional)</label>
                        <textarea id="case-study-intro" v-model="form.intro_text" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        <p class="mt-1 text-xs text-gray-400">Shown on the first card. Left empty, a short standard introduction is used.</p>
                        <p v-if="form.errors.intro_text" class="mt-1 text-sm text-red-600">{{ form.errors.intro_text }}</p>
                    </div>
                    <label class="flex items-center gap-2">
                        <input v-model="form.is_published" type="checkbox" class="rounded border-gray-300" />
                        <span class="text-sm text-gray-700">Published (visitors can see this case study)</span>
                    </label>
                    <p v-if="form.errors.is_published" class="text-sm text-red-600">{{ form.errors.is_published }}</p>
                </div>

                <div
                    v-for="(step, index) in form.steps"
                    :key="index"
                    class="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg"
                >
                    <CollapsibleSection :default-open="!step.title">
                        <template #title>
                            <h4 class="font-medium text-gray-900">
                                <span class="rounded bg-gray-100 px-2 py-0.5 text-xs uppercase text-gray-500">Step {{ index + 1 }}</span>
                                {{ step.title || 'New step' }}
                            </h4>
                        </template>
                        <template #actions>
                            <button type="button" class="text-sm text-gray-500 hover:text-dare-navy disabled:opacity-30" :disabled="index === 0" aria-label="Move step up" @click="moveStep(index, -1)">&uarr;</button>
                            <button type="button" class="text-sm text-gray-500 hover:text-dare-navy disabled:opacity-30" :disabled="index === form.steps.length - 1" aria-label="Move step down" @click="moveStep(index, 1)">&darr;</button>
                            <button type="button" class="text-sm text-red-600 hover:text-red-800" @click="removeStep(index)">Remove</button>
                        </template>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Heading</label>
                                <input v-model="step.title" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                <p v-if="stepError(index, 'title')" class="mt-1 text-sm text-red-600">{{ stepError(index, 'title') }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Text</label>
                                <textarea v-model="step.text" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                <p v-if="stepError(index, 'text')" class="mt-1 text-sm text-red-600">{{ stepError(index, 'text') }}</p>
                            </div>
                            <fieldset>
                                <legend class="block text-sm font-medium text-gray-700">Boxes to light up</legend>
                                <div class="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                                    <label v-for="box in boxes" :key="box.key" class="flex items-center gap-2 text-sm text-gray-700">
                                        <input v-model="step.boxes" type="checkbox" :value="box.key" class="rounded border-gray-300" />
                                        {{ box.label }}
                                    </label>
                                </div>
                                <p v-if="step.boxes.length" class="mt-2 text-xs text-gray-400">
                                    Lit: {{ step.boxes.map((key) => boxLabels[key] ?? key).join(', ') }}
                                </p>
                                <p v-if="stepError(index, 'boxes')" class="mt-1 text-sm text-red-600">{{ stepError(index, 'boxes') }}</p>
                            </fieldset>
                            <div>
                                <span class="block text-sm font-medium text-gray-700">Pictures</span>
                                <div v-for="(image, imageIndex) in step.images" :key="imageIndex" class="mt-2 space-y-2 rounded-md border border-gray-200 p-3">
                                    <ImageUploadField v-model="image.src" />
                                    <input v-model="image.alt" type="text" placeholder="Short description for screen readers" class="block w-full rounded-md border-gray-300 text-sm shadow-sm" />
                                    <button type="button" class="text-xs text-red-600 hover:text-red-800" @click="step.images.splice(imageIndex, 1)">Remove picture</button>
                                </div>
                                <button
                                    v-if="step.images.length < 4"
                                    type="button"
                                    class="mt-2 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                                    @click="addImage(step)"
                                >
                                    Add picture
                                </button>
                                <p v-if="stepError(index, 'images')" class="mt-1 text-sm text-red-600">{{ stepError(index, 'images') }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Picture caption (optional)</label>
                                <input v-model="step.caption" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <button type="button" class="rounded-md bg-white px-4 py-2 text-sm font-medium text-dare-navy shadow-sm ring-1 ring-gray-200 hover:bg-gray-50" @click="addStep">
                        Add step
                    </button>
                    <PrimaryButton :disabled="form.processing">Save case study</PrimaryButton>
                    <span v-if="form.recentlySuccessful" class="text-sm text-green-600">Saved.</span>
                    <span v-if="form.hasErrors" class="text-sm text-red-600">Some fields need fixing — see the messages above.</span>
                    <button type="button" class="ml-auto text-sm text-red-600 hover:text-red-800" @click="confirmingDelete = true">
                        Delete case study
                    </button>
                </div>
            </div>
        </form>

        <ConfirmDialog
            :show="confirmingDelete"
            :title="`Delete the ${caseStudy.title} case study?`"
            confirm-label="Delete"
            :processing="deleting"
            @confirm="destroy"
            @cancel="confirmingDelete = false"
        >
            This removes it and all its steps. It can't be undone.
        </ConfirmDialog>
    </AuthenticatedLayout>
</template>
