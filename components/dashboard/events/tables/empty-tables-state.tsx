import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

interface EmptyTablesStateProps {
  onBulkCreate: () => void;
  onAddTable: () => void;
}

export function EmptyTablesState({ onBulkCreate, onAddTable }: EmptyTablesStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tables yet</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Create tables for VIP areas, bottle service, or shared seating.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBulkCreate}>
            <Package className="mr-2 h-4 w-4" />
            Bulk Create
          </Button>
          <Button onClick={onAddTable}>
            <Plus className="mr-2 h-4 w-4" />
            Add Table
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
