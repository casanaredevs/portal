<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Permissions\Permission as PermEnum;
use App\Permissions\PermissionMetadata;
use App\Permissions\RolePermissions;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RolePermissionController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::with('permissions')->orderBy('name')->get()->map(fn($r) => [
            'id' => $r->id,
            'name' => $r->name,
            'permissions' => $r->permissions->pluck('name')->values()->all(),
            'is_admin_star' => $r->name === 'admin',
        ])->all();

        $meta = PermissionMetadata::all();
        $permissions = collect(PermEnum::cases())
            ->map(fn($c) => [
                'name' => $c->value,
                'label' => $meta[$c->value]['label'] ?? $c->value,
                'category' => $meta[$c->value]['category'] ?? 'General',
            ])->values()->all();

        // Usuarios (simple listado paginado básico: primeros 25, con roles)
        $users = User::with('roles')->limit(25)->orderBy('id')->get()->map(fn($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'username' => $u->username,
            'roles' => $u->roles->pluck('name')->values()->all(),
        ])->all();

        if ($request->wantsJson()) {
            return response()->json([
                'roles' => $roles,
                'permissions' => $permissions,
                'permissionMeta' => $meta,
                'roleMap' => RolePermissions::MAP,
                'users' => $users,
            ]);
        }

        return Inertia::render('admin/roles-permissions', [
            'roles' => $roles,
            'permissions' => $permissions,
            'permissionMeta' => $meta,
            'roleMap' => RolePermissions::MAP,
            'users' => $users,
        ]);
    }

    public function syncRolePermissions(Role $role, Request $request)
    {
        $data = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in(RolePermissions::allPermissions())],
        ]);
        if ($role->name === 'admin') {
            // admin siempre tiene todos
            $role->syncPermissions(RolePermissions::allPermissions());
        } else {
            $perms = $data['permissions'] ?? [];
            $role->syncPermissions($perms);
        }
        return back()->with('success', 'Permisos del rol actualizados.');
    }

    public function syncUserRoles(User $user, Request $request)
    {
        $allowedRoles = array_keys(RolePermissions::MAP);
        $data = $request->validate([
            'roles' => ['array'],
            'roles.*' => ['string', Rule::in($allowedRoles)],
        ]);
        $newRoles = $data['roles'] ?? [];

        if (!in_array('admin', $newRoles, true)) {
            $adminRoleId = \Spatie\Permission\Models\Role::where('name','admin')->value('id');
            if ($adminRoleId) {
                $otherAdmins = \DB::table('model_has_roles')
                    ->where('role_id', $adminRoleId)
                    ->where('model_id', '!=', $user->id)
                    ->count();
                if ($user->hasRole('admin') && $otherAdmins === 0) {
                    return back()->withErrors(['roles' => 'No se puede remover el último administrador.']);
                }
            }
        }

        $user->syncRoles($newRoles);
        return back()->with('success', 'Roles del usuario actualizados.');
    }
}
