'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Trash2, Edit2, Check, MessageSquare } from 'lucide-react';
import {
  addApplicationNoteAction,
  updateApplicationNoteAction,
  deleteApplicationNoteAction,
} from '@/app/actions/admin';
import { type Application, formatUserName } from './types';

interface NotesTabProps {
  application: Application;
}

export function NotesTab({ application }: NotesTabProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    const result = await addApplicationNoteAction(application.id, newNote);
    setIsAddingNote(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Note added');
      setNewNote('');
      router.refresh();
    }
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editNoteText.trim()) return;
    setIsLoading(true);
    const result = await updateApplicationNoteAction(noteId, editNoteText);
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Note updated');
      setEditingNoteId(null);
      setEditNoteText('');
      router.refresh();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setIsLoading(true);
    const result = await deleteApplicationNoteAction(noteId);
    setIsLoading(false);
    setDeleteTarget(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Note deleted');
      router.refresh();
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Internal Notes
        </CardTitle>
        <CardDescription>Private notes visible only to admins</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note */}
        <div className="space-y-3">
          <Textarea
            placeholder="Write a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleAddNote}
            disabled={isAddingNote || !newNote.trim()}
            size="sm"
          >
            {isAddingNote ? 'Adding...' : 'Add Note'}
          </Button>
        </div>

        <Separator />

        {/* Notes List */}
        {application.notes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {application.notes.map((note) => (
              <div key={note.id} className="rounded-lg border p-4">
                {editingNoteId === note.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(note.id)} disabled={isLoading}>
                        <Check className="h-3 w-3 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingNoteId(null); setEditNoteText(''); }} disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">{formatUserName(note.user)}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(note.createdAt), 'MMM d, yyyy')} at {format(new Date(note.createdAt), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          aria-label="Edit note"
                          onClick={() => { setEditingNoteId(note.id); setEditNoteText(note.note); }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          aria-label="Delete note"
                          onClick={() => setDeleteTarget(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <ConfirmationDialog
      open={!!deleteTarget}
      onOpenChange={(open) => !open && setDeleteTarget(null)}
      title="Delete note"
      description="Are you sure you want to delete this note?"
      confirmLabel="Delete"
      variant="destructive"
      loading={isLoading}
      onConfirm={() => deleteTarget && handleDeleteNote(deleteTarget)}
    />
    </>
  );
}
