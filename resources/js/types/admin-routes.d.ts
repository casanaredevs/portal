// Global ambient types for admin route helpers
// This allows using `adminPath()` and `adminRoutes` without importing explicitly if desired.
// (You can still import for tree-shaking clarity.)

declare global {
    function adminPath(...segments: string[]): string;
    const adminRoutes: {
        index: () => string;
        rolesPermissions: () => string;
    };
}

export {};
