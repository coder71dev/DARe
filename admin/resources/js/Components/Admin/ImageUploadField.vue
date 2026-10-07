<script setup>
// An "image" field's value is just a path relative to public/ (same as the
// hand-typed "assets/..." paths these fields have always accepted — see
// App\Http\Controllers\Admin\MediaController). This lets the admin either
// type a path directly or upload a file, which fills the field in for them.
import { ref } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);

const uploading = ref(false);
const error = ref('');
const fileInput = ref(null);

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function pickFile() {
    fileInput.value?.click();
}

async function onFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }

    uploading.value = true;
    error.value = '';

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(route('admin.media.store'), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken(),
                Accept: 'application/json',
            },
            body: formData,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.errors?.file?.[0] ?? data?.message ?? 'Upload failed.');
        }

        emit('update:modelValue', data.path);
    } catch (e) {
        error.value = e.message ?? 'Upload failed.';
    } finally {
        uploading.value = false;
        event.target.value = '';
    }
}
</script>

<template>
    <div>
        <div class="flex items-center gap-2">
            <input
                :value="modelValue"
                type="text"
                placeholder="assets/img/... or upload a file"
                class="block w-full rounded-md border-gray-300 shadow-sm"
                @input="emit('update:modelValue', $event.target.value)"
            />
            <button
                type="button"
                :disabled="uploading"
                class="shrink-0 rounded-md bg-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                @click="pickFile"
            >
                {{ uploading ? 'Uploading…' : 'Upload' }}
            </button>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
        </div>
        <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
        <img
            v-if="modelValue"
            :src="`/${modelValue}`"
            alt=""
            class="mt-2 h-16 w-auto rounded border border-gray-200 object-contain"
        />
    </div>
</template>
