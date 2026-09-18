// Node-to-route map for Figma Andora (Copy) fileKey 7IHCYJs2bVqT4uzuCJKzhF.
// Each Figma node-id maps to exactly one expo-router route; routes hosting
// several nodes render them as states (e.g. /assistant covers listening,
// processing, and chat variants).
export const ANDORA_FILE_KEY = '7IHCYJs2bVqT4uzuCJKzhF';

export const NODE_ROUTE_MAP = {
  '18-1034': '/(start)',
  '11-6': '/home',
  '21-1064': '/assistant',
  '22-1220': '/assistant',
  '22-1254': '/assistant/validate',
  '23-1311': '/assistant',
  '29-1786': '/assistant',
  '43-356': '/home/insight',
  '41-121': '/home/sessions',
  '43-217': '/home/sessions',
} as const;

export type AndoraNodeId = keyof typeof NODE_ROUTE_MAP;

export const ROUTE_FILE_MAP: Record<string, string> = {
  '/(start)': 'app/(start)/index.tsx',
  '/onboarding': 'app/onboarding/index.tsx',
  '/auth': 'app/auth/index.tsx',
  '/home': 'app/home/index.tsx',
  '/home/sessions': 'app/home/sessions.tsx',
  '/home/insight': 'app/home/insight.tsx',
  '/assistant': 'app/assistant/index.tsx',
  '/assistant/validate': 'app/assistant/validate.tsx',
};

export function getRouteForNode(nodeId: string): string {
  const route = (NODE_ROUTE_MAP as Record<string, string>)[nodeId];
  if (!route) {
    throw new Error('Unknown Andora Figma node: ' + nodeId);
  }
  return route;
}

export function getFileForRoute(route: string): string {
  const file = ROUTE_FILE_MAP[route];
  if (!file) {
    throw new Error('Unknown Andora route: ' + route);
  }
  return file;
}

export function listNodeIds(): AndoraNodeId[] {
  return Object.keys(NODE_ROUTE_MAP) as AndoraNodeId[];
}
