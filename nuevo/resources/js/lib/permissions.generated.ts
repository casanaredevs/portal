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

