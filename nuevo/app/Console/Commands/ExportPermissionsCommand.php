<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Permissions\Permission as PermissionEnum;
use App\Permissions\PermissionMetadata;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class ExportPermissionsCommand extends Command
{
    protected $signature = 'permissions:export {--path=resources/js/lib/permissions.generated.ts : Ruta destino relativa a base_path}';

    protected $description = 'Exporta la enum de permisos PHP a un archivo TypeScript (const PERMISSIONS)';

    public function handle(): int
    {
        $pathOption = $this->option('path');
        $target = base_path($pathOption);

        $cases = PermissionEnum::cases();
        $entries = [];
        foreach ($cases as $case) {
            // Transformar events.publish -> EVENTS_PUBLISH
            $key = Str::of($case->value)->upper()->replace(['.', '-'], '_');
            $entries[] = [ 'key' => (string) $key, 'value' => $case->value ];
        }

        $meta = PermissionMetadata::all();

        $lines = [];
        $lines[] = '/* AUTO-GENERATED FILE - DO NOT EDIT';
        $lines[] = '   Run: php artisan permissions:export';
        $lines[] = ' */';
        $lines[] = '';
        $lines[] = 'export const PERMISSIONS = {';
        foreach ($entries as $e) { $lines[] = "  {$e['key']}: '{$e['value']}',"; }
        $lines[] = '} as const;';
        $lines[] = '';
        $lines[] = 'export type PermissionString = typeof PERMISSIONS[keyof typeof PERMISSIONS];';
        $lines[] = 'export const PERMISSIONS_LIST: PermissionString[] = Object.values(PERMISSIONS);';
        $lines[] = '';
        $lines[] = 'export const PERMISSION_META: Record<PermissionString,{label:string;category:string;description?:string}> = {';
        foreach ($meta as $perm => $data) {
            $label = addslashes($data['label']);
            $category = addslashes($data['category']);
            $desc = isset($data['description']) ? addslashes($data['description']) : null;
            $lines[] = "  '{$perm}': { label: '{$label}', category: '{$category}'" . ($desc ? ", description: '{$desc}'" : '') . ' },';
        }
        $lines[] = '};';
        $lines[] = '';
        $content = implode(PHP_EOL, $lines) . PHP_EOL;

        (new Filesystem())->ensureDirectoryExists(dirname($target));
        file_put_contents($target, $content);

        $this->info('Permisos exportados a: ' . $pathOption);
        return self::SUCCESS;
    }
}
