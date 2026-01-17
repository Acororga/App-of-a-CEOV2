import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Search, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

export default function Notes() {
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedTags, setExpandedTags] = useState(new Set(['all']));
  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: () => base44.entities.Note.list('-updated_date')
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries(['notes']);
      setSelectedNote(newNote);
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      setSelectedNote(null);
    }
  });

  // Extract tags from note content
  const extractTags = (content) => {
    if (!content) return [];
    const tagRegex = /#[\w\u00C0-\u024F\u1E00-\u1EFF\/]+/g;
    const matches = content.match(tagRegex) || [];
    return [...new Set(matches.map(tag => tag.slice(1)))]; // Remove #
  };

  // Build tag hierarchy
  const buildTagHierarchy = () => {
    const allTags = new Set();
    notes.forEach(note => {
      const tags = extractTags(note.content);
      tags.forEach(tag => allTags.add(tag));
    });

    const hierarchy = {};
    allTags.forEach(tag => {
      const parts = tag.split('/');
      let current = hierarchy;
      parts.forEach((part, index) => {
        const fullPath = parts.slice(0, index + 1).join('/');
        if (!current[part]) {
          current[part] = { children: {}, fullPath, count: 0 };
        }
        current = current[part].children;
      });
    });

    // Count notes per tag
    const countNotes = (tag) => {
      return notes.filter(note => {
        const noteTags = extractTags(note.content);
        return noteTags.some(t => t === tag || t.startsWith(tag + '/'));
      }).length;
    };

    const addCounts = (obj) => {
      Object.keys(obj).forEach(key => {
        obj[key].count = countNotes(obj[key].fullPath);
        if (Object.keys(obj[key].children).length > 0) {
          addCounts(obj[key].children);
        }
      });
    };
    addCounts(hierarchy);

    return hierarchy;
  };

  const tagHierarchy = buildTagHierarchy();

  // Filter notes by selected tag and search
  const filteredNotes = notes.filter(note => {
    const noteTags = extractTags(note.content);
    const matchesTag = selectedTag === 'all' || 
      noteTags.some(t => t === selectedTag || t.startsWith(selectedTag + '/'));
    
    if (!matchesTag) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return note.content.toLowerCase().includes(query);
    }
    
    return true;
  });

  // Get note title (first line)
  const getNoteTitle = (content) => {
    if (!content) return 'Untitled';
    const firstLine = content.split('\n')[0].trim();
    return firstLine.replace(/^#+\s*/, '').slice(0, 60) || 'Untitled';
  };

  // Get note preview
  const getNotePreview = (content) => {
    if (!content) return '';
    const lines = content.split('\n');
    const preview = lines.slice(1).join(' ').trim();
    return preview.slice(0, 100);
  };

  // Handle content change with auto-save
  const handleContentChange = (content) => {
    if (!selectedNote) return;

    setSelectedNote({ ...selectedNote, content });

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      updateNoteMutation.mutate({
        id: selectedNote.id,
        data: { content }
      });
    }, 500);
  };

  // Create new note
  const handleNewNote = () => {
    if (createNoteMutation.isPending) return;
    
    createNoteMutation.mutate({
      title: 'Untitled',
      content: '',
      tags: [],
      color: 'default',
      pinned: false,
      archived: false
    });
  };

  // Delete note with confirmation
  const handleDeleteNote = () => {
    if (!selectedNote) return;
    if (window.confirm('Delete this note?')) {
      deleteNoteMutation.mutate(selectedNote.id);
    }
  };

  // Toggle tag expansion
  const toggleTag = (tag) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tag)) {
      newExpanded.delete(tag);
    } else {
      newExpanded.add(tag);
    }
    setExpandedTags(newExpanded);
  };

  // Render tag tree
  const renderTagTree = (obj, level = 0) => {
    return Object.keys(obj).sort().map(key => {
      const tag = obj[key];
      const hasChildren = Object.keys(tag.children).length > 0;
      const isExpanded = expandedTags.has(tag.fullPath);
      const isSelected = selectedTag === tag.fullPath;

      return (
        <div key={tag.fullPath}>
          <button
            onClick={() => {
              setSelectedTag(tag.fullPath);
              if (hasChildren) toggleTag(tag.fullPath);
            }}
            className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 relative group ${
              isSelected 
                ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/60 text-white border-l-4 border-indigo-500 shadow-[inset_0_0_20px_rgba(99,102,241,0.15)]' 
                : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border-l-4 border-transparent'
            }`}
            style={{ paddingLeft: `${level * 16 + 16}px` }}
          >
            {hasChildren && (
              <span className={`w-4 h-4 flex items-center justify-center transition-transform ${isExpanded ? '' : '-rotate-90'}`}>
                <ChevronDown className="w-3 h-3" />
              </span>
            )}
            {!hasChildren && <span className="w-4" />}
            <span className="flex-1 text-left truncate">{key}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isSelected
                ? 'bg-indigo-900/60 text-indigo-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]'
                : 'bg-zinc-800/50 text-zinc-600'
            }`}>
              {tag.count}
            </span>
          </button>
          {hasChildren && isExpanded && renderTagTree(tag.children, level + 1)}
        </div>
      );
    });
  };

  // Sync selected note with notes list
  useEffect(() => {
    if (selectedNote && selectedNote.id) {
      const updated = notes.find(n => n.id === selectedNote.id);
      if (updated && updated.content !== selectedNote.content) {
        setSelectedNote(updated);
      }
    }
  }, [notes, selectedNote]);

  // Auto-focus editor when note is selected
  useEffect(() => {
    if (selectedNote && editorRef.current) {
      editorRef.current.focus();
    }
  }, [selectedNote]);

  return (
    <div className="min-h-screen bg-black text-white pt-16 relative overflow-hidden">
      {/* Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-b border-zinc-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.6)] z-50 flex items-center justify-between px-6">
        <Link to={createPageUrl('Home')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700/50 active:scale-95 transition-all duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </Link>
        
        <div className="text-base font-black tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
          Notes
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-52 h-10 px-4 bg-zinc-900/80 backdrop-blur-sm border-2 border-zinc-800/80 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-700/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-colors"
              autoFocus
              onBlur={() => !searchQuery && setShowSearch(false)}
            />
          )}
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-indigo-700/50 active:scale-95 transition-all duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            >
              <Search className="w-4 h-4 text-zinc-400" />
            </button>
          )}
          <button
            onClick={handleNewNote}
            disabled={createNoteMutation.isPending}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 border-2 border-indigo-500/30 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 active:scale-95 transition-all duration-150 shadow-[0_4px_16px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 text-white drop-shadow-sm" />
          </button>
        </div>
      </div>

      {/* 3 Column Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Tags */}
        <div className="w-72 border-r-2 border-zinc-900/80 bg-zinc-950/40 backdrop-blur-sm overflow-y-auto shadow-[inset_-4px_0_16px_rgba(0,0,0,0.3)]">
          <button
            onClick={() => setSelectedTag('all')}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all duration-150 relative group ${
              selectedTag === 'all' 
                ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/60 text-white border-l-4 border-indigo-500 shadow-[inset_0_0_20px_rgba(99,102,241,0.15)]' 
                : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border-l-4 border-transparent'
            }`}
          >
            <span>All Notes</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedTag === 'all'
                ? 'bg-indigo-900/60 text-indigo-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]'
                : 'bg-zinc-800/50 text-zinc-600'
            }`}>
              {notes.length}
            </span>
          </button>
          <div className="mt-1">
            {renderTagTree(tagHierarchy)}
          </div>
        </div>

        {/* Middle Column - Notes List */}
        <div className="w-96 border-r-2 border-zinc-900/80 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto shadow-[inset_-4px_0_16px_rgba(0,0,0,0.3)]">
          {filteredNotes.map(note => {
            const isSelected = selectedNote?.id === note.id;
            return (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`w-full p-5 border-b border-zinc-900/60 hover:bg-zinc-900/40 transition-all duration-150 text-left relative group ${
                  isSelected ? 'bg-zinc-900/60 border-l-4 border-indigo-500 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]' : 'border-l-4 border-transparent'
                }`}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/30 to-transparent pointer-events-none" />
                )}
                <div className="relative">
                  <div className={`font-bold text-sm mb-2 truncate ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                    {getNoteTitle(note.content)}
                  </div>
                  <div className={`text-xs mb-2 ${isSelected ? 'text-indigo-400' : 'text-zinc-600'}`}>
                    {format(new Date(note.updated_date), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {getNotePreview(note.content)}
                  </div>
                </div>
              </button>
            );
          })}
          {filteredNotes.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-zinc-700 text-6xl mb-4">📝</div>
              <div className="text-zinc-600 text-sm font-medium">No notes found</div>
            </div>
          )}
        </div>

        {/* Right Column - Editor */}
        <div className="flex-1 overflow-y-auto bg-black/40">
          {selectedNote ? (
            <div className="max-w-4xl mx-auto p-12">
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleDeleteNote}
                  className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-red-950/40 hover:border-red-800/50 active:scale-95 transition-all duration-150 text-zinc-500 hover:text-red-400 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Textarea
                ref={editorRef}
                value={selectedNote.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing... Use #tag to organize"
                className="w-full min-h-[calc(100vh-16rem)] bg-transparent border-none focus:ring-0 resize-none text-base leading-loose text-zinc-100 p-0 placeholder:text-zinc-700 font-light tracking-wide"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-zinc-800 text-8xl mb-6">✏️</div>
              <div className="text-zinc-600 text-sm font-medium">Select a note or create a new one</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}