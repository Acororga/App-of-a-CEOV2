import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Search, Pin, Archive, Trash2, X, ChevronRight, ChevronDown } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Notes() {
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [expandedTags, setExpandedTags] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Note.filter({ created_by: user.email });
    }
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData) => {
      const user = await base44.auth.me();
      
      // Check if currently in Focus/CEO mode
      const sessions = await base44.entities.FocusSession.filter({ created_by: user.email });
      const ceoSessions = await base44.entities.CEOModeSession.filter({ created_by: user.email });
      const inFocus = sessions.some(s => !s.end_time);
      const inCEO = ceoSessions.some(s => !s.end_time);
      
      return await base44.entities.Note.create({
        ...noteData,
        created_during_focus: inFocus || inCEO,
        last_opened_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      setShowEditor(false);
      setEditingNote(null);
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Note.update(id, {
        ...data,
        last_opened_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      setShowEditor(false);
      setEditingNote(null);
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id) => await base44.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['notes'])
  });

  // Extract tags from content
  const extractTags = (content) => {
    const tagRegex = /#([a-zA-Z0-9_/]+)/g;
    const matches = content.match(tagRegex) || [];
    return [...new Set(matches.map(tag => tag.slice(1)))];
  };

  // Build tag hierarchy
  const tagHierarchy = useMemo(() => {
    const allTags = new Set();
    notes.forEach(note => {
      if (!note.archived) {
        note.tags?.forEach(tag => {
          allTags.add(tag);
          const parts = tag.split('/');
          for (let i = 1; i < parts.length; i++) {
            allTags.add(parts.slice(0, i).join('/'));
          }
        });
      }
    });

    const buildTree = (tags) => {
      const tree = {};
      tags.forEach(tag => {
        const parts = tag.split('/');
        let current = tree;
        parts.forEach((part, idx) => {
          const path = parts.slice(0, idx + 1).join('/');
          if (!current[part]) {
            current[part] = { 
              path, 
              children: {}, 
              count: notes.filter(n => !n.archived && n.tags?.some(t => t === path || t.startsWith(path + '/'))).length 
            };
          }
          current = current[part].children;
        });
      });
      return tree;
    };

    return buildTree([...allTags]);
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    let result = notes.filter(n => !n.archived);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title?.toLowerCase().includes(query) ||
        n.content?.toLowerCase().includes(query) ||
        n.tags?.some(t => t.toLowerCase().includes(query))
      );
    } else if (selectedTag) {
      result = result.filter(n => 
        n.tags?.some(t => t === selectedTag || t.startsWith(selectedTag + '/'))
      );
    }

    // Sort: pinned first, then by last_opened_date or updated_date
    return result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const dateA = new Date(a.last_opened_date || a.updated_date);
      const dateB = new Date(b.last_opened_date || b.updated_date);
      return dateB - dateA;
    });
  }, [notes, selectedTag, searchQuery]);

  // Notes to revisit
  const notesToRevisit = useMemo(() => {
    const now = new Date();
    return notes.filter(n => {
      if (n.archived || n.pinned) return false;
      const lastOpened = n.last_opened_date ? new Date(n.last_opened_date) : new Date(n.created_date);
      const daysSinceOpened = differenceInDays(now, lastOpened);
      return daysSinceOpened >= 14 || (n.created_during_focus && daysSinceOpened >= 7);
    }).sort((a, b) => {
      const dateA = new Date(a.last_opened_date || a.created_date);
      const dateB = new Date(b.last_opened_date || b.created_date);
      return dateA - dateB;
    }).slice(0, 5);
  }, [notes]);

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleSaveNote = (noteData) => {
    const tags = extractTags(noteData.content);
    const dataWithTags = { ...noteData, tags };
    
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data: dataWithTags });
    } else {
      createNoteMutation.mutate(dataWithTags);
    }
  };

  const togglePin = (note) => {
    updateNoteMutation.mutate({ 
      id: note.id, 
      data: { ...note, pinned: !note.pinned } 
    });
  };

  const archiveNote = (note) => {
    updateNoteMutation.mutate({ 
      id: note.id, 
      data: { ...note, archived: true } 
    });
  };

  const toggleTagExpanded = (path) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedTags(newExpanded);
  };

  const renderTagTree = (tree, level = 0) => {
    return Object.entries(tree).map(([name, data]) => {
      const hasChildren = Object.keys(data.children).length > 0;
      const isExpanded = expandedTags.has(data.path);
      const isSelected = selectedTag === data.path;

      return (
        <div key={data.path}>
          <button
            onClick={() => setSelectedTag(data.path)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left group ${
              isSelected 
                ? 'bg-indigo-950/60 border border-indigo-800/60 text-indigo-300' 
                : 'hover:bg-zinc-900/60 text-zinc-400'
            }`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTagExpanded(data.path);
                }}
                className="p-0.5 hover:bg-zinc-800/50 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            <span className="flex-1 text-sm font-medium">#{name}</span>
            <span className={`text-xs font-bold ${isSelected ? 'text-indigo-400' : 'text-zinc-600'}`}>
              {data.count}
            </span>
          </button>
          {hasChildren && isExpanded && (
            <div className="mt-1">
              {renderTagTree(data.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 pb-6 relative overflow-hidden">
      {/* Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors duration-150 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>

          <h1 className="text-2xl font-black bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            Notes
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 ${
                searchOpen 
                  ? 'bg-indigo-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.4)]' 
                  : 'bg-zinc-900/70 text-zinc-400 hover:bg-zinc-900/90'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingNote(null);
                setShowEditor(true);
              }}
              className="w-11 h-11 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="mb-6 animate-in slide-in-from-top-4 duration-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, tags, content..."
                autoFocus
                className="pl-11 bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/60 h-12 placeholder:text-zinc-600 text-white focus:border-indigo-500/50 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.02)]"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-800/50 rounded-lg transition-all"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Notes to Revisit */}
            {!searchQuery && !selectedTag && notesToRevisit.length > 0 && (
              <div>
                <div className="text-xs text-zinc-600 font-black uppercase tracking-[0.15em] mb-4">
                  Notes to revisit
                </div>
                <div className="space-y-3">
                  {notesToRevisit.map(note => {
                    const lastOpened = note.last_opened_date ? new Date(note.last_opened_date) : new Date(note.created_date);
                    const daysAgo = differenceInDays(new Date(), lastOpened);
                    return (
                      <div key={note.id} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-lg opacity-40" />
                        <div 
                          className="relative p-4 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-amber-700/40 hover:border-amber-600/60 cursor-pointer active:scale-[0.98] transition-all duration-150 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                          onClick={() => handleEditNote(note)}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-sm font-bold text-white line-clamp-1">{note.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePin(note);
                                }}
                                className="p-1.5 hover:bg-zinc-800/60 rounded-lg transition-all"
                              >
                                <Pin className="w-3.5 h-3.5 text-zinc-500" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveNote(note);
                                }}
                                className="p-1.5 hover:bg-zinc-800/60 rounded-lg transition-all"
                              >
                                <Archive className="w-3.5 h-3.5 text-zinc-500" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{note.content}</p>
                          <div className="text-[10px] text-amber-400/70 font-medium">
                            {note.created_during_focus 
                              ? `Written during focus session ${daysAgo} days ago` 
                              : `Not opened for ${daysAgo} days`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Notes */}
            <div>
              {!searchQuery && !selectedTag && (
                <div className="text-xs text-zinc-600 font-black uppercase tracking-[0.15em] mb-4">
                  {filteredNotes.some(n => n.pinned) ? 'Pinned & Recent' : 'Recent Notes'}
                </div>
              )}
              {selectedTag && (
                <div className="text-xs text-zinc-600 font-black uppercase tracking-[0.15em] mb-4">
                  #{selectedTag}
                </div>
              )}
              <div className="space-y-3">
                {filteredNotes.map(note => (
                  <div key={note.id} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                    <div 
                      className="relative p-4 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/60 hover:border-zinc-700/70 cursor-pointer active:scale-[0.98] transition-all duration-150 shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)]"
                      onClick={() => handleEditNote(note)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {note.pinned && (
                              <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                <Pin className="w-2.5 h-2.5 text-amber-400" />
                              </div>
                            )}
                            <h3 className="text-base font-bold text-white line-clamp-1">{note.title}</h3>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            {format(new Date(note.updated_date), 'MMM d, yyyy • HH:mm')}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(note);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
                              note.pinned 
                                ? 'bg-amber-500/20 text-amber-400' 
                                : 'hover:bg-zinc-800/60 text-zinc-500'
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveNote(note);
                            }}
                            className="p-1.5 hover:bg-zinc-800/60 rounded-lg transition-all"
                          >
                            <Archive className="w-3.5 h-3.5 text-zinc-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-3 mb-3 leading-relaxed">{note.content}</p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {note.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="text-[10px] px-2 py-1 rounded-lg bg-indigo-950/50 border border-indigo-800/50 text-indigo-300 font-bold backdrop-blur-sm"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredNotes.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-zinc-600 mb-3 font-semibold">
                      {searchQuery ? 'No notes found' : selectedTag ? 'No notes with this tag' : 'No notes yet'}
                    </div>
                    <button
                      onClick={() => setShowEditor(true)}
                      className="text-sm text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                    >
                      Create your first note
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Tags */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="text-xs text-zinc-600 font-black uppercase tracking-[0.15em] mb-4">
                Tags
              </div>
              <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                    selectedTag === null 
                      ? 'bg-indigo-950/60 border border-indigo-800/60 text-indigo-300' 
                      : 'hover:bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  <span className="flex-1 text-sm font-medium">All Notes</span>
                  <span className={`text-xs font-bold ${selectedTag === null ? 'text-indigo-400' : 'text-zinc-600'}`}>
                    {notes.filter(n => !n.archived).length}
                  </span>
                </button>
                {renderTagTree(tagHierarchy)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onDelete={(id) => {
            if (window.confirm('Delete this note?')) {
              deleteNoteMutation.mutate(id);
              setShowEditor(false);
            }
          }}
          onClose={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
}

function NoteEditor({ note, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [pinned, setPinned] = useState(note?.pinned || false);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({ title, content, pinned });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-50 animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-6 overflow-y-auto">
        <div className="relative w-full max-w-3xl my-8" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/25 to-purple-500/25 rounded-[32px] blur-3xl" />
          <div className="relative p-8 rounded-[32px] bg-gradient-to-br from-zinc-900/98 via-zinc-850/98 to-zinc-900/98 backdrop-blur-2xl border-2 border-zinc-700/60 shadow-[0_32px_128px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                {note ? 'Edit Note' : 'New Note'}
              </h2>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-zinc-800/60 rounded-xl transition-all duration-150 active:scale-95 border border-zinc-800/50"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
                  className="bg-black/60 backdrop-blur-sm border border-zinc-800/60 h-14 text-xl font-black placeholder:text-zinc-700 text-white focus:border-indigo-500/50 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)]"
                  autoFocus
                />
              </div>

              <div className="relative">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing... Use #tags for organization (e.g., #work/project or #personal/ideas)"
                  className="bg-black/60 backdrop-blur-sm border border-zinc-800/60 min-h-[400px] text-sm leading-relaxed placeholder:text-zinc-700 text-white resize-none focus:border-indigo-500/50 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)]"
                />
              </div>

              <div className="flex gap-3 pt-6">
                {note && (
                  <Button
                    onClick={() => onDelete(note.id)}
                    variant="outline"
                    className="bg-red-950/30 border-2 border-red-900/60 text-red-400 hover:bg-red-950/50 hover:border-red-800/70 h-12 px-5 rounded-xl font-bold shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95 transition-all"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button
                  onClick={() => setPinned(!pinned)}
                  variant="outline"
                  className={`h-12 px-5 rounded-xl font-bold shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95 transition-all border-2 ${
                    pinned 
                      ? 'bg-amber-950/40 border-amber-700/60 text-amber-300 hover:bg-amber-950/60 shadow-[0_4px_16px_rgba(245,158,11,0.3)]' 
                      : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-400 hover:bg-zinc-900/80 hover:border-zinc-700/70'
                  }`}
                >
                  <Pin className="w-4 h-4 mr-2" />
                  {pinned ? 'Pinned' : 'Pin'}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title.trim() || !content.trim()}
                  className="flex-1 bg-gradient-to-r from-white to-zinc-100 text-black hover:from-zinc-100 hover:to-zinc-200 h-12 font-black rounded-xl shadow-[0_8px_24px_rgba(255,255,255,0.15)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}