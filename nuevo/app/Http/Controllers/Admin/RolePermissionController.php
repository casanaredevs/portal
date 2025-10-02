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
        $search = $request->string('search')->trim()->value();
        $perPage = (int) $request->get('per_page', 25);
        $perPage = $perPage > 100 ? 100 : ($perPage < 5 ? 5 : $perPage);

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

        $usersQuery = User::with('roles')
            ->when($search, function($q) use ($search) {
                $q->where(function($qq) use ($search) {
                    $qq->where('username','like',"%{$search}%")
                       ->orWhere('name','like',"%{$search}%")
                       ->orWhere('email','like',"%{$search}%");
                });
            })
            ->orderBy('id');

        $usersPaginator = $usersQuery->paginate($perPage)->withQueryString();
        $usersTransformed = collect($usersPaginator->items())->map(fn($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'username' => $u->username,
            'roles' => $u->roles->pluck('name')->values()->all(),
        ])->all();

        $adminsCount = User::role('admin')->count();

        $payload = [
            'roles' => $roles,
            'permissions' => $permissions,
            'permissionMeta' => $meta,
            'roleMap' => RolePermissions::MAP,
            'users' => [
                'data' => $usersTransformed,
                'current_page' => $usersPaginator->currentPage(),
                'last_page' => $usersPaginator->lastPage(),
                'per_page' => $usersPaginator->perPage(),
                'total' => $usersPaginator->total(),
                'links' => $usersPaginator->linkCollection()->toArray(),
            ],
            'filters' => [ 'search' => $search, 'per_page' => $perPage ],
            'admins_count' => $adminsCount,
            'breadcrumbs' => [
                [ 'title' => 'Dashboard', 'href' => route('dashboard') ],
                [ 'title' => 'Administración', 'href' => route('admin.index') ],
                [ 'title' => 'Roles y Permisos', 'href' => route('admin.roles-permissions.index') ],
            ],
        ];

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('admin/roles-permissions', $payload);
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

    public function bulkUserRoles(Request $request)
    {
        $data = $request->validate([
            'user_ids' => ['required','array','min:1'],
            'user_ids.*' => ['integer','exists:users,id'],
            'roles' => ['required','array','min:1'],
            'roles.*' => ['string', Rule::in(array_keys(RolePermissions::MAP))],
            'mode' => ['sometimes','string', Rule::in(['attach','sync'])],
        ]);
        $mode = $data['mode'] ?? 'attach';
        $roles = $data['roles'];

        $adminInRoles = in_array('admin',$roles,true);
        $adminRoleId = Role::where('name','admin')->value('id');
        $adminsBefore = User::role('admin')->count();

        // If mode sync and we would remove admin from all current admins without reassigning -> block
        if ($mode === 'sync' && !$adminInRoles) {
            // Count how many selected users are admins; if equals total admins and no admin role kept -> block
            $selectedAdmins = User::whereIn('id',$data['user_ids'])->role('admin')->count();
            if ($selectedAdmins === $adminsBefore) {
                return back()->withErrors(['roles' => 'No se puede quitar rol admin de todos los administradores.']);
            }
        }

        $users = User::whereIn('id',$data['user_ids'])->get();
        foreach ($users as $user) {
            if ($mode === 'sync') {
                // Prevent removing last admin
                if (!$adminInRoles && $user->hasRole('admin')) {
                    $otherAdmins = User::role('admin')->where('id','!=',$user->id)->count();
                    if ($otherAdmins === 0) {
                        continue; // skip this user
                    }
                }
                $user->syncRoles($roles);
            } else { // attach
                foreach ($roles as $roleName) {
                    if ($roleName === 'admin' && !$user->hasRole('admin')) {
                        // simple assign
                        $user->assignRole('admin');
                    } else {
                        if (!$user->hasRole($roleName)) $user->assignRole($roleName);
                    }
                }
            }
        }

        return back()->with('success','Roles aplicados a usuarios seleccionados.');
    }
}
