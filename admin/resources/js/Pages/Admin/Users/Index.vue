<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import ConfirmDialog from '@/Components/Admin/ConfirmDialog.vue';
import Pagination from '@/Components/Admin/Pagination.vue';
import PageHeading from '@/Components/Admin/PageHeading.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({
    users: Object,
});

const showCreate = ref(false);
const form = useForm({ name: '', email: '' });

function createUser() {
    form.post(route('admin.users.store'), {
        onSuccess: () => {
            form.reset();
            showCreate.value = false;
        },
    });
}

const editingUserId = ref(null);
const editForm = useForm({ name: '', email: '' });

function startEdit(user) {
    editingUserId.value = user.id;
    editForm.clearErrors();
    editForm.name = user.name;
    editForm.email = user.email;
}

function cancelEdit() {
    editingUserId.value = null;
}

function saveEdit(user) {
    editForm.patch(route('admin.users.update', user.id), {
        preserveScroll: true,
        onSuccess: () => {
            editingUserId.value = null;
        },
    });
}

const confirmingRemoval = ref(null);
const removeForm = useForm({});

function confirmRemoveUser(user) {
    confirmingRemoval.value = user;
}

function cancelRemoveUser() {
    confirmingRemoval.value = null;
}

function removeUser() {
    removeForm.delete(route('admin.users.destroy', confirmingRemoval.value.id), {
        preserveScroll: true,
        onSuccess: () => {
            confirmingRemoval.value = null;
        },
    });
}
</script>

<template>
    <Head title="Admin users" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeading icon="users" accent="navy" title="Admin users">
                <template #actions>
                    <PrimaryButton type="button" @click="showCreate = !showCreate">
                        New admin
                    </PrimaryButton>
                </template>
            </PageHeading>
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                <div v-if="showCreate" class="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                    <form class="flex flex-wrap items-end gap-4" @submit.prevent="createUser">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                v-model="form.name"
                                type="text"
                                class="mt-1 block w-64 rounded-md border-gray-300 shadow-sm"
                            />
                            <p v-if="form.errors.name" class="mt-1 text-sm text-red-600">{{ form.errors.name }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                v-model="form.email"
                                type="email"
                                class="mt-1 block w-64 rounded-md border-gray-300 shadow-sm"
                            />
                            <p v-if="form.errors.email" class="mt-1 text-sm text-red-600">{{ form.errors.email }}</p>
                        </div>
                        <PrimaryButton type="submit" :disabled="form.processing" :class="{ 'opacity-50': form.processing }">
                            Create & send invite
                        </PrimaryButton>
                    </form>
                    <p class="mt-3 text-sm text-gray-500">
                        A temporary password and a link to set their own password will be emailed to them.
                    </p>
                </div>

                <div class="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Added</th>
                                <th class="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="user in users.data" :key="user.id" class="transition hover:bg-gray-50">
                                <template v-if="editingUserId === user.id">
                                    <td class="px-6 py-3">
                                        <input
                                            v-model="editForm.name"
                                            type="text"
                                            class="block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                        />
                                        <p v-if="editForm.errors.name" class="mt-1 text-xs text-red-600">{{ editForm.errors.name }}</p>
                                    </td>
                                    <td class="px-6 py-3">
                                        <input
                                            v-model="editForm.email"
                                            type="email"
                                            class="block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                        />
                                        <p v-if="editForm.errors.email" class="mt-1 text-xs text-red-600">{{ editForm.errors.email }}</p>
                                    </td>
                                    <td class="px-6 py-3 text-sm text-gray-500">{{ new Date(user.created_at).toLocaleDateString() }}</td>
                                    <td class="px-6 py-3 text-right text-sm space-x-3">
                                        <button
                                            type="button"
                                            :disabled="editForm.processing"
                                            class="font-medium text-dare-sky hover:text-dare-navy disabled:opacity-50"
                                            @click="saveEdit(user)"
                                        >
                                            Save
                                        </button>
                                        <button type="button" class="text-gray-500 hover:text-gray-700" @click="cancelEdit">Cancel</button>
                                    </td>
                                </template>
                                <template v-else>
                                    <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ user.name }}</td>
                                    <td class="px-6 py-4 text-sm text-gray-500">{{ user.email }}</td>
                                    <td class="px-6 py-4 text-sm text-gray-500">{{ new Date(user.created_at).toLocaleDateString() }}</td>
                                    <td class="px-6 py-4 text-right text-sm space-x-4">
                                        <button
                                            type="button"
                                            class="text-dare-sky hover:text-dare-navy"
                                            @click="startEdit(user)"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            class="text-red-600 hover:text-red-900"
                                            @click="confirmRemoveUser(user)"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </template>
                            </tr>
                            <tr v-if="users.data.length === 0">
                                <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500">No admin users yet.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="users.data.length > 0" class="flex items-center justify-between">
                    <p class="text-sm text-gray-500">
                        Showing {{ users.from }}–{{ users.to }} of {{ users.total }}
                    </p>
                    <Pagination :links="users.links" />
                </div>
            </div>
        </div>

        <ConfirmDialog
            :show="confirmingRemoval !== null"
            title="Remove admin account?"
            confirm-label="Remove"
            :processing="removeForm.processing"
            @confirm="removeUser"
            @cancel="cancelRemoveUser"
        >
            This removes <strong v-if="confirmingRemoval">{{ confirmingRemoval.name }}</strong>'s access to the admin panel. They can be invited again later if needed.
        </ConfirmDialog>
    </AuthenticatedLayout>
</template>
