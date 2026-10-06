<?php

namespace App\Support;

/**
 * Per-icon Figma size/position data (px in the 1920 frame) for the icon
 * classes whose CSS positions them entirely via --w/--h/--top/--right/--left
 * custom properties (.tile-icon, .card-icon, .info-bar-icon in style.css) —
 * the original static HTML baked these in as inline styles per <img>, but
 * the block system only stores the icon's asset path, so they're recovered
 * here keyed by that path.
 */
class IconMetrics
{
    /** @return array<string, array{w: int, h: int, top?: int, right?: int, left?: int}> */
    private static function all(): array
    {
        return [
            // Audience tiles (.tile-icon: top/right/w)
            'assets/icons/audience-1.svg' => ['w' => 66, 'h' => 70, 'top' => 40, 'right' => 38],
            'assets/icons/audience-2.svg' => ['w' => 57, 'h' => 72, 'top' => 31, 'right' => 43],
            'assets/icons/audience-3.svg' => ['w' => 77, 'h' => 52, 'top' => 31, 'right' => 52],
            'assets/icons/audience-4.svg' => ['w' => 60, 'h' => 57, 'top' => 24, 'right' => 44],
            'assets/icons/audience-5.svg' => ['w' => 73, 'h' => 66, 'top' => 24, 'right' => 44],
            'assets/icons/audience-6.svg' => ['w' => 68, 'h' => 66, 'top' => 24, 'right' => 48],

            // Resource cards (.card-icon: top/right/w/h)
            'assets/icons/icon-publications.png' => ['w' => 53, 'h' => 61, 'top' => 36, 'right' => 49],
            'assets/icons/handbook.svg' => ['w' => 42, 'h' => 61, 'top' => 35, 'right' => 39],
            'assets/icons/icon-search-card.svg' => ['w' => 39, 'h' => 61, 'top' => 28, 'right' => 42],

            // Collapsible info bars (.info-bar-icon: left/w/h)
            'assets/icons/bar-website.svg' => ['w' => 36, 'h' => 59, 'left' => 31],
            'assets/icons/bar-repository.svg' => ['w' => 55, 'h' => 55, 'left' => 31],
            'assets/icons/bar-email.svg' => ['w' => 46, 'h' => 36, 'left' => 35],
        ];
    }

    /** Width/height HTML attributes for the given icon path, or an empty array if unknown. */
    public static function dimensions(?string $path): array
    {
        $m = self::all()[$path] ?? null;

        return $m ? ['width' => $m['w'], 'height' => $m['h']] : [];
    }

    /** The inline `style` attribute value carrying this icon's --w/--h/--top/--right/--left vars, or '' if unknown. */
    public static function style(?string $path): string
    {
        $m = self::all()[$path] ?? null;

        if (! $m) {
            return '';
        }

        $parts = [];
        foreach ($m as $key => $value) {
            $parts[] = "--{$key}:{$value}";
        }

        return implode(';', $parts);
    }
}
