import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, X, Pin, Archive, Tag, Search, FileText } from 'lucide-react';
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
      default: { bg: 'from-zinc-900/80 to-zinc-850/80', border: 'border-zinc-700/60' },
      red: { bg: 'from-red-950/70 to-red-900/70', border: 'border-red-700/60' },
      orange: { bg: 'from-orange-950/70 to-orange-900/70', border: 'border-orange-700/60' },
      yellow: { bg: 'from-yellow-950/70 to-yellow-900/70', border: 'border-yellow-700/60' },
      green: { bg: 'from-green-950/70 to-green-900/70', border: 'border-green-700/60' },
      blue: { bg: 'from-blue-950/70 to-blue-900/70', border: 'border-blue-700/60' },
      purple: { bg: 'from-purple-950/70 to-purple-900/70', border: 'border-purple-700/60' },
      pink: { bg: 'from-pink-950/70 to-pink-900/70', border: 'border-pink-700/60' }
    };
    return colorMap[color] || colorMap.default;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 pb-6 relative overflow-hidden">
      {/* Texture de fond */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      {/* Glow d'ambiance */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-indigo-500/15 via-purple-500/8 to-transparent rounded-full blur-[120px] opacity-50 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors duration-150 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>

          <h1 className="text-2xl font-black bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            Notes
          </h1>

          <button
            onClick={() => {
              setEditingNote(null);
              setNoteForm({ title: '', content: '', tags: [], color: 'default', pinned: false });
              setShowNoteEditor(true);
            }}
            className="w-11 h-11 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-xl blur-lg pointer-events-none" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="pl-11 bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/60 h-12 placeholder:text-zinc-600 text-white focus:border-indigo-500/50 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.02)]"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:scale-95 ${
                selectedTag === 'all'
                  ? 'bg-white text-black'
                  : 'bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/60 text-zinc-500 hover:border-zinc-700/60 hover:bg-zinc-900/90'
              }`}
            >
              All Notes
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:scale-95 ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.4)]'
                    : 'bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/60 text-zinc-500 hover:border-zinc-700/60 hover:bg-zinc-900/90'
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
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
                <div 
                  className={`relative p-5 rounded-2xl bg-gradient-to-br ${colorClasses.bg} backdrop-blur-sm border ${colorClasses.border} hover:border-opacity-100 cursor-pointer active:scale-[0.98] transition-all duration-150 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.02)]`}
                  onClick={() => handleEditNote(note)}
                >
                  {note.pinned && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/40 rounded-full blur-md" />
                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.6)]">
                          <Pin className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-black text-white mb-1.5 line-clamp-2 tracking-tight">{note.title}</h3>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      {format(new Date(note.updated_date), 'MMM d, yyyy • HH:mm')}
                    </div>
                  </div>

                  <div className="text-sm text-zinc-400 mb-4 line-clamp-5 leading-relaxed">
                    {note.content}
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {note.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="text-[10px] px-2.5 py-1.5 rounded-lg bg-indigo-950/50 border border-indigo-800/50 text-indigo-300 font-bold backdrop-blur-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                        >
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
            <div className="col-span-full text-center py-24">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl" />
                <div className="relative w-16 h-16 rounded-full bg-zinc-900/80 border-2 border-zinc-800/60 flex items-center justify-center mx-auto backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <FileText className="w-7 h-7 text-zinc-600" />
                </div>
              </div>
              <div className="text-zinc-600 mb-3 font-semibold">No notes yet</div>
              <button
                onClick={() => setShowNoteEditor(true)}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
              >
                Create your first note
              </button>
            </div>
          )}
        </div>

        {/* Note Editor Modal */}
        {showNoteEditor && (
          <>
            <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-50 animate-in fade-in duration-200" onClick={() => setShowNoteEditor(false)} />
            <div className="fixed inset-0 z-50 flex items-start justify-center p-6 overflow-y-auto">
              <div className="relative w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/25 to-purple-500/25 rounded-[32px] blur-3xl" />
                <div className="relative p-8 rounded-[32px] bg-gradient-to-br from-zinc-900/98 via-zinc-850/98 to-zinc-900/98 backdrop-blur-2xl border-2 border-zinc-700/60 shadow-[0_32px_128px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                      {editingNote ? 'Edit Note' : 'New Note'}
                    </h2>
                    <button
                      onClick={() => setShowNoteEditor(false)}
                      className="p-2.5 hover:bg-zinc-800/60 rounded-xl transition-all duration-150 active:scale-95 border border-zinc-800/50"
                    >
                      <X className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-xl blur-lg pointer-events-none" />
                      <Input
                        value={noteForm.title}
                        onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Note title"
                        className="relative bg-black/60 backdrop-blur-sm border border-zinc-800/60 h-14 text-xl font-black placeholder:text-zinc-700 text-white focus:border-indigo-500/50 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)]"
                        autoFocus
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-xl blur-lg pointer-events-none" />
                      <Textarea
                        value={noteForm.content}
                        onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Start writing..."
                        className="relative bg-black/60 backdrop-blur-sm border border-zinc-800/60 min-h-[240px] text-sm leading-relaxed placeholder:text-zinc-700 text-white resize-none focus:border-indigo-500/50 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)]"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="text-[10px] text-zinc-600 font-black mb-3 uppercase tracking-[0.15em]">Tags</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {noteForm.tags.map(tag => (
                          <div key={tag} className="group/tag flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-950/60 border border-indigo-800/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(0,0,0,0.2)] hover:bg-indigo-950/80 transition-all">
                            <span className="text-xs text-indigo-300 font-bold">#{tag}</span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:bg-indigo-900/60 rounded-lg p-1 transition-all active:scale-95"
                            >
                              <X className="w-3 h-3 text-indigo-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-xl blur-lg pointer-events-none" />
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Add tag..."
                            className="relative bg-black/60 backdrop-blur-sm border border-zinc-800/60 h-11 text-sm placeholder:text-zinc-700 focus:border-indigo-500/50 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                          />
                        </div>
                        <Button
                          onClick={handleAddTag}
                          size="sm"
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-11 px-4 rounded-xl font-bold shadow-[0_4px_16px_rgba(99,102,241,0.4)] active:scale-95 transition-all"
                        >
                          <Tag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <div className="text-[10px] text-zinc-600 font-black mb-3 uppercase tracking-[0.15em]">Color Theme</div>
                      <div className="flex gap-2.5 flex-wrap">
                        {colorOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setNoteForm(prev => ({ ...prev, color: opt.value }))}
                            className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${opt.color} border-2 transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-95 ${
                              noteForm.color === opt.value 
                                ? `${opt.border} scale-110 shadow-[0_6px_20px_rgba(99,102,241,0.4)]` 
                                : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                            }`}
                          >
                            {noteForm.color === opt.value && (
                              <div className="absolute inset-0 rounded-xl bg-white/10" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-6">
                      {editingNote && (
                        <Button
                          onClick={() => {
                            if (window.confirm('Delete this note?')) {
                              deleteNoteMutation.mutate(editingNote.id);
                              setShowNoteEditor(false);
                            }
                          }}
                          variant="outline"
                          className="bg-red-950/30 border-2 border-red-900/60 text-red-400 hover:bg-red-950/50 hover:border-red-800/70 h-12 px-5 rounded-xl font-bold shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95 transition-all"
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        onClick={() => setNoteForm(prev => ({ ...prev, pinned: !prev.pinned }))}
                        variant="outline"
                        className={`h-12 px-5 rounded-xl font-bold shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95 transition-all border-2 ${
                          noteForm.pinned 
                            ? 'bg-amber-950/40 border-amber-700/60 text-amber-300 hover:bg-amber-950/60 shadow-[0_4px_16px_rgba(245,158,11,0.3)]' 
                            : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-400 hover:bg-zinc-900/80 hover:border-zinc-700/70'
                        }`}
                      >
                        <Pin className="w-4 h-4 mr-2" />
                        {noteForm.pinned ? 'Pinned' : 'Pin'}
                      </Button>
                      <Button
                        onClick={() => createNoteMutation.mutate(noteForm)}
                        disabled={!noteForm.title.trim() || !noteForm.content.trim() || createNoteMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-white to-zinc-100 text-black hover:from-zinc-100 hover:to-zinc-200 h-12 font-black rounded-xl shadow-[0_8px_24px_rgba(255,255,255,0.15)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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