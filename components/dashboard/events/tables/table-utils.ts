import type { TableItem, TableInventory } from './types';

export function getTableInventory(table: TableItem): TableInventory {
  if (table.ticketTypes.length === 0) {
    return { totalQty: null, totalSold: null, totalAvailable: null };
  }
  const totalQty = table.ticketTypes.reduce((sum, tt) => sum + (tt.quantityTotal ?? 0), 0);
  const totalSold = table.ticketTypes.reduce((sum, tt) => sum + tt.quantitySold, 0);
  const hasUnlimited = table.ticketTypes.some((tt) => tt.quantityTotal === null);
  return { totalQty, totalSold, totalAvailable: totalQty - totalSold, hasUnlimited };
}

export function groupTablesByTicketType(tables: TableItem[]): Map<string, TableItem[]> {
  const groupMap = new Map<string, TableItem[]>();
  for (const table of tables) {
    if (table.ticketTypes.length === 0) {
      const list = groupMap.get('Unassigned') ?? [];
      list.push(table);
      groupMap.set('Unassigned', list);
    } else {
      const groupNames = new Set(table.ticketTypes.map((tt) => tt.name));
      for (const name of groupNames) {
        const list = groupMap.get(name) ?? [];
        list.push(table);
        groupMap.set(name, list);
      }
    }
  }
  return groupMap;
}

export function getSortedGroupNames(groupMap: Map<string, TableItem[]>): string[] {
  return Array.from(groupMap.keys()).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });
}
