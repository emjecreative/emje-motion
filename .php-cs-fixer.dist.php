<?php

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__ . '/src')
    ->exclude('Updater/stub')
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

        'native_function_invocation' => false,

        'void_return' => true,

        'nullable_type_declaration_for_default_null_value' => true,

        'phpdoc_align' => ['align' => 'left'],

        'phpdoc_trim' => true,

        'phpdoc_separation' => true,

        'yoda_style' => false,

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
