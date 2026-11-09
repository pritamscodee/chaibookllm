// Built from the theme's chart colors so cards follow the active theme (light/dark).
const GRADIENTS = [
    "from-chart-1 via-chart-1/80 to-chart-4",
    "from-chart-2 via-chart-2/80 to-chart-3",
    "from-chart-3 via-chart-3/80 to-chart-5",
    "from-chart-4 via-chart-4/80 to-chart-1",
    "from-chart-5 via-chart-5/80 to-chart-2",
    "from-chart-1 via-chart-2/80 to-chart-3",
    "from-chart-2 via-chart-4/80 to-chart-1",
    "from-chart-3 via-chart-5/80 to-chart-4",
] as const;

function hashString(value: string) {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash);
}

export function getWorkspaceGradient(workspaceId: string) {
    return GRADIENTS[hashString(workspaceId) % GRADIENTS.length];
}
