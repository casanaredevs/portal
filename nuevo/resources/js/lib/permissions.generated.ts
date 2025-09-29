/* AUTO-GENERATED FILE - DO NOT EDIT
   Run: php artisan permissions:export
 */

export const PERMISSIONS = {
  EVENTS_CREATE: 'events.create',
  EVENTS_EDIT: 'events.edit',
  EVENTS_DELETE: 'events.delete',
  EVENTS_PUBLISH: 'events.publish',
  EVENTS_REGISTER: 'events.register',
  SKILLS_ADD: 'skills.add',
  SKILLS_MODERATE: 'skills.moderate',
  TECHNOLOGIES_MANAGE: 'technologies.manage',
  USERS_MANAGE: 'users.manage',
  EXTERNAL_PROFILES_SYNC: 'external-profiles.sync',
} as const;

export type PermissionString = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export const PERMISSIONS_LIST: PermissionString[] = Object.values(PERMISSIONS);

export const PERMISSION_META: Record<PermissionString,{label:string;category:string;description?:string}> = {
  'events.create': { label: 'Crear eventos', category: 'Eventos' },
  'events.edit': { label: 'Editar eventos', category: 'Eventos' },
  'events.delete': { label: 'Eliminar eventos', category: 'Eventos' },
  'events.publish': { label: 'Publicar eventos', category: 'Eventos' },
  'events.register': { label: 'Registrarse a eventos', category: 'Eventos' },
  'skills.add': { label: 'Agregar skills propias', category: 'Skills' },
  'skills.moderate': { label: 'Moderar skills', category: 'Skills' },
  'technologies.manage': { label: 'Gestionar tecnologías', category: 'Tecnologías' },
  'users.manage': { label: 'Gestionar usuarios y roles', category: 'Usuarios' },
  'external-profiles.sync': { label: 'Sincronizar perfiles externos', category: 'Perfiles Externos' },
};

