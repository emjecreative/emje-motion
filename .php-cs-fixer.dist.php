<?php

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__ . '/src')
    ->append([__DIR__ . '/emje-motion.php']);

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(true)
    ->setFinder($finder)
    ->setRules([
        '@PSR12' => true,

        'array_syntax' => [
            'syntax' => 'short',
        ],

        'ordered_imports' => [
            'sort_algorithm' => 'alpha',
        ],

        'single_quote' => true,

        'no_unused_imports' => true,

        'trailing_comma_in_multiline' => [
            'elements' => [
                'arrays',
                'arguments',
                'parameters',
                'match',
            ],
        ],

        'declare_strict_types' => true,

        'blank_line_after_opening_tag' => true,

        'no_extra_blank_lines' => true,

        'no_whitespace_in_blank_line' => true,

        'binary_operator_spaces' => [
            'default' => 'single_space',
        ],

        'class_attributes_separation' => [
            'elements' => [
                'method' => 'one',
            ],
        ],
    ]);
