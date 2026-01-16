import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
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
    createNoteMutation.mutate({
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
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-900/50 transition-colors ${
              isSelected ? 'bg-zinc-900/70 text-white' : 'text-zinc-400'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {hasChildren && (
              <span className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </span>
            )}
            {!hasChildren && <span className="w-4" />}
            <span className="flex-1 text-left truncate">{key}</span>
            <span className="text-xs text-zinc-600">{tag.count}</span>
          </button>
          {hasChildren && isExpanded && renderTagTree(tag.children, level + 1)}
        </div>
      );
    });
  };

  // Sync selected note with notes list
  useEffect(() => {
    if (selectedNote) {
      const updated = notes.find(n => n.id === selectedNote.id);
      if (updated && updated.content !== selectedNote.content) {
        setSelectedNote(updated);
      }
    }
  }, [notes]);

  return (
    <div className="min-h-screen bg-black text-white pt-16 relative overflow-hidden">
      {/* Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-zinc-900 z-50 flex items-center justify-between px-6">
        <Link to={createPageUrl('Home')} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="text-sm font-bold text-zinc-400">Notes</div>

        <div className="flex items-center gap-3">
          {showSearch && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-48 h-9 px-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-700"
              autoFocus
              onBlur={() => !searchQuery && setShowSearch(false)}
            />
          )}
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 flex items-center justify-center hover:bg-zinc-900/50 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4 text-zinc-500" />
            </button>
          )}
          <button
            onClick={handleNewNote}
            className="w-9 h-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Column Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Tags */}
        <div className="w-64 border-r border-zinc-900 overflow-y-auto">
          <button
            onClick={() => setSelectedTag('all')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-zinc-900/50 transition-colors ${
              selectedTag === 'all' ? 'bg-zinc-900/70 text-white' : 'text-zinc-400'
            }`}
          >
            <span>All Notes</span>
            <span className="text-xs text-zinc-600">{notes.length}</span>
          </button>
          <div className="mt-2">
            {renderTagTree(tagHierarchy)}
          </div>
        </div>

        {/* Middle Column - Notes List */}
        <div className="w-80 border-r border-zinc-900 overflow-y-auto">
          {filteredNotes.map(note => {
            const isSelected = selectedNote?.id === note.id;
            return (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`w-full p-4 border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors text-left ${
                  isSelected ? 'bg-zinc-900/50' : ''
                }`}
              >
                <div className="font-semibold text-sm mb-1 truncate">
                  {getNoteTitle(note.content)}
                </div>
                <div className="text-xs text-zinc-600 mb-2">
                  {format(new Date(note.updated_date), 'MMM d, yyyy')}
                </div>
                <div className="text-xs text-zinc-500 line-clamp-2">
                  {getNotePreview(note.content)}
                </div>
              </button>
            );
          })}
          {filteredNotes.length === 0 && (
            <div className="p-8 text-center text-zinc-600 text-sm">
              No notes
            </div>
          )}
        </div>

        {/* Right Column - Editor */}
        <div className="flex-1 overflow-y-auto">
          {selectedNote ? (
            <div className="max-w-3xl mx-auto p-8">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleDeleteNote}
                  className="p-2 hover:bg-zinc-900/50 rounded-lg transition-colors text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Textarea
                ref={editorRef}
                value={selectedNote.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing... Use #tag to organize"
                className="w-full min-h-[calc(100vh-12rem)] bg-transparent border-none focus:ring-0 resize-none text-base leading-relaxed p-0 placeholder:text-zinc-700"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
              Select a note or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}