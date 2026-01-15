import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, X, Pin, Archive, Tag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export default function Notes() {
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: [],
    color: 'default',
    pinned: false
  });
  const [newTag, setNewTag] = useState('');

  const { data: notes } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Note.filter({
        created_by: user.email,
        archived: false
      }, '-updated_date');
    },
    initialData: []
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      if (editingNote) {
        return await base44.entities.Note.update(editingNote.id, data);
      }
      return await base44.entities.Note.create({
        ...data,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      setShowNoteEditor(false);
      setEditingNote(null);
      setNoteForm({ title: '', content: '', tags: [], color: 'default', pinned: false });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId) => {
      await base44.entities.Note.delete(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ noteId, pinned }) => {
      await base44.entities.Note.update(noteId, { pinned: !pinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
    }
  });

  const allTags = React.useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  const filteredNotes = React.useMemo(() => {
    let filtered = notes || [];
    
    if (selectedTag !== 'all') {
      filtered = filtered.filter(note => note.tags?.includes(selectedTag));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title?.toLowerCase().includes(query) || 
        note.content?.toLowerCase().includes(query)
      );
    }
    
    const pinned = filtered.filter(n => n.pinned);
    const unpinned = filtered.filter(n => !n.pinned);
    
    return [...pinned, ...unpinned];
  }, [notes, selectedTag, searchQuery]);

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      color: note.color || 'default',
      pinned: note.pinned || false
    });
    setShowNoteEditor(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !noteForm.tags.includes(newTag.trim())) {
      setNoteForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setNoteForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const colorOptions = [
    { value: 'default', color: 'from-zinc-700/30 to-zinc-600/30', border: 'border-zinc-700/40' },
    { value: 'red', color: 'from-red-900/30 to-red-800/30', border: 'border-red-700/40' },
    { value: 'orange', color: 'from-orange-900/30 to-orange-800/30', border: 'border-orange-700/40' },
    { value: 'yellow', color: 'from-yellow-900/30 to-yellow-800/30', border: 'border-yellow-700/40' },
    { value: 'green', color: 'from-green-900/30 to-green-800/30', border: 'border-green-700/40' },
    { value: 'blue', color: 'from-blue-900/30 to-blue-800/30', border: 'border-blue-700/40' },
    { value: 'purple', color: 'from-purple-900/30 to-purple-800/30', border: 'border-purple-700/40' },
    { value: 'pink', color: 'from-pink-900/30 to-pink-800/30', border: 'border-pink-700/40' }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      default: { bg: 'from-zinc-900/70 to-zinc-850/70', border: 'border-zinc-700/50' },
      red: { bg: 'from-red-950/60 to-red-900/60', border: 'border-red-700/50' },
      orange: { bg: 'from-orange-950/60 to-orange-900/60', border: 'border-orange-700/50' },
      yellow: { bg: 'from-yellow-950/60 to-yellow-900/60', border: 'border-yellow-700/50' },
      green: { bg: 'from-green-950/60 to-green-900/60', border: 'border-green-700/50' },
      blue: { bg: 'from-blue-950/60 to-blue-900/60', border: 'border-blue-700/50' },
      purple: { bg: 'from-purple-950/60 to-purple-900/60', border: 'border-purple-700/50' },
      pink: { bg: 'from-pink-950/60 to-pink-900/60', border: 'border-pink-700/50' }
    };
    return colorMap[color] || colorMap.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 relative overflow-hidden">
      {/* Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors active:scale-95">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>

          <Button
            onClick={() => {
              setEditingNote(null);
              setNoteForm({ title: '', content: '', tags: [], color: 'default', pinned: false });
              setShowNoteEditor(true);
            }}
            className="bg-white text-black hover:bg-zinc-200 h-10 px-5 text-sm font-bold rounded-xl active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-11 bg-zinc-900/60 border-zinc-700/50 h-11 placeholder:text-zinc-700"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTag === 'all'
                  ? 'bg-white text-black'
                  : 'bg-zinc-900/60 border border-zinc-800/50 text-zinc-500 hover:border-zinc-700/50'
              }`}
            >
              All Notes
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900/60 border border-zinc-800/50 text-zinc-500 hover:border-zinc-700/50'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => {
            const colorClasses = getColorClasses(note.color);
            return (
              <div key={note.id} className="group relative">
                <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${colorClasses.bg} border ${colorClasses.border} hover:border-opacity-80 cursor-pointer active:scale-[0.98] transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
                     onClick={() => handleEditNote(note)}>
                  
                  {note.pinned && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                        <Pin className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-2">{note.title}</h3>
                    <div className="text-xs text-zinc-500 font-medium">
                      {format(new Date(note.updated_date), 'MMM d, yyyy • HH:mm')}
                    </div>
                  </div>

                  <div className="text-sm text-zinc-400 mb-3 line-clamp-4 leading-relaxed">
                    {note.content}
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {note.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-1 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300 font-semibold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="text-zinc-700 mb-2">No notes yet</div>
              <button
                onClick={() => setShowNoteEditor(true)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Create your first note
              </button>
            </div>
          )}
        </div>

        {/* Note Editor Modal */}
        {showNoteEditor && (
          <>
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50" onClick={() => setShowNoteEditor(false)} />
            <div className="fixed inset-0 z-50 flex items-start justify-center p-6 overflow-y-auto">
              <div className="relative w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[32px] blur-2xl" />
                <div className="relative p-8 rounded-[32px] bg-gradient-to-br from-zinc-900/98 via-zinc-850/98 to-zinc-900/98 backdrop-blur-xl border-2 border-zinc-700/60 shadow-[0_24px_96px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black tracking-tight">
                      {editingNote ? 'Edit Note' : 'New Note'}
                    </h2>
                    <button
                      onClick={() => setShowNoteEditor(false)}
                      className="p-2 hover:bg-zinc-800/50 rounded-xl transition-all active:scale-95"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <Input
                      value={noteForm.title}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Note title"
                      className="bg-zinc-900/80 border-zinc-700/50 h-12 text-lg font-semibold placeholder:text-zinc-700"
                      autoFocus
                    />

                    <Textarea
                      value={noteForm.content}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Start writing..."
                      className="bg-zinc-900/80 border-zinc-700/50 min-h-[200px] text-sm leading-relaxed placeholder:text-zinc-700 resize-none"
                    />

                    {/* Tags */}
                    <div>
                      <div className="text-xs text-zinc-600 font-bold mb-2 uppercase tracking-wider">Tags</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {noteForm.tags.map(tag => (
                          <div key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-950/50 border border-blue-800/50">
                            <span className="text-xs text-blue-300 font-semibold">#{tag}</span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:bg-blue-900/50 rounded p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3 text-blue-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          placeholder="Add tag..."
                          className="flex-1 bg-zinc-900/80 border-zinc-700/50 h-10 text-sm"
                        />
                        <Button
                          onClick={handleAddTag}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 h-10 px-4"
                        >
                          <Tag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <div className="text-xs text-zinc-600 font-bold mb-3 uppercase tracking-wider">Color</div>
                      <div className="flex gap-2">
                        {colorOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setNoteForm(prev => ({ ...prev, color: opt.value }))}
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.color} border-2 transition-all ${
                              noteForm.color === opt.value 
                                ? `${opt.border} scale-110 shadow-lg` 
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      {editingNote && (
                        <Button
                          onClick={() => {
                            if (window.confirm('Delete this note?')) {
                              deleteNoteMutation.mutate(editingNote.id);
                              setShowNoteEditor(false);
                            }
                          }}
                          variant="outline"
                          className="bg-transparent border-red-900/50 text-red-500 hover:bg-red-950/30"
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        onClick={() => setNoteForm(prev => ({ ...prev, pinned: !prev.pinned }))}
                        variant="outline"
                        className={`${noteForm.pinned ? 'bg-amber-950/30 border-amber-700/50 text-amber-400' : 'bg-transparent border-zinc-700/50'}`}
                      >
                        <Pin className="w-4 h-4 mr-2" />
                        {noteForm.pinned ? 'Pinned' : 'Pin'}
                      </Button>
                      <Button
                        onClick={() => createNoteMutation.mutate(noteForm)}
                        disabled={!noteForm.title.trim() || !noteForm.content.trim() || createNoteMutation.isPending}
                        className="flex-1 bg-white text-black hover:bg-zinc-200 h-11 font-bold rounded-xl"
                      >
                        {createNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}