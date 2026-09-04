<?php
spl_autoload_register(function ($class) {
    $baseDir = __DIR__ . '/';

    $paths = [
        'Core/' . $class . '.php',
        'Models/' . $class . '.php',
        'Controllers/' . $class . '.php',
    ];

    foreach ($paths as $path) {
        $file = $baseDir . $path;
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});
