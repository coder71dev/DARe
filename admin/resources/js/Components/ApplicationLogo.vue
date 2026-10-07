<template>
    <!--
        The DARe wordmark is white-on-transparent (designed for the public
        site's dark header), so it needs a dark backing to stay legible
        wherever this component is placed — brand navy, with a faint ring
        so it still reads as a distinct mark when sat on an equally-navy
        surface like the admin top bar.
    -->
    <div class="inline-flex items-center rounded-md bg-dare-navy px-3 py-2 ring-1 ring-white/15">
        <img src="/images/dare-logo.svg" alt="DARe" class="h-full w-auto" />
    </div>
</template>
