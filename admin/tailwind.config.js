import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.vue',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            // DARe's own palette (see site/assets/css for the source values)
            // in place of Breeze's default indigo/gray, so the admin panel
            // reads as DARe's rather than a generic Laravel scaffold.
            colors: {
                dare: {
                    navy: '#00295e',
                    green: '#5ecf70',
                    sky: '#0096ff',
                    stone: '#e6e6e6',
                },
            },
        },
    },

    plugins: [forms],
};
