<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageHeading from '@/Components/Admin/PageHeading.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({
    users: Array,
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

function removeUser(user) {
    if (!confirm(`Remove ${user.name}'s admin account?`)) {
        return;
    }

    useForm({}).delete(route('admin.users.destroy', user.id));
}
</script>

<template>
    <Head title="Admin users" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeading icon="users" accent="navy" title="Admin users">
                <template #actions>
                    <button
                        type="button"
                        class="rounded-md bg-dare-navy px-3 py-2 text-sm font-medium text-white hover:bg-dare-navy/90"
                        @click="showCreate = !showCreate"
                    >
                        New admin
                    </button>
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
                        <button
                            type="submit"
                            :disabled="form.processing"
                            class="rounded-md bg-dare-sky px-4 py-2 text-sm font-medium text-white hover:bg-dare-sky/90 disabled:opacity-50"
                        >
                            Create & send invite
                        </button>
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
                            <tr v-for="user in users" :key="user.id">
                                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ user.name }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ user.email }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ new Date(user.created_at).toLocaleDateString() }}</td>
                                <td class="px-6 py-4 text-right text-sm">
                                    <button
                                        type="button"
                                        class="text-red-600 hover:text-red-900"
                                        @click="removeUser(user)"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
