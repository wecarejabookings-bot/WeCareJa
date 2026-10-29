import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Upload, 
  Check, 
  Search, 
  Layers, 
  Image as ImageIcon, 
  Tag, 
  AlertCircle,
  FileText,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { 
  TopicDirectoryItem, 
  fetchAdminTopicsDirectory, 
  createTopicDirectoryItem, 
  updateTopicDirectoryItem, 
  deleteTopicDirectoryItem, 
  reorderTopicsDirectory, 
  resetTopicsToDefault 
} from '../../services/topicsDirectoryService';
import { 
  CMSContentItem, 
  fetchCMSContent, 
  updateCMSItem, 
  resetCMSItem 
} from '../../services/cmsService';
import { ImageUploadCropModal } from './ImageUploadCropModal';
import { UserAccount } from '../../types';

interface AdminTopicsDirectoryManagerProps {
  currentUser?: UserAccount | null;
}

export const AdminTopicsDirectoryManager: React.FC<AdminTopicsDirectoryManagerProps> = ({
  currentUser
}) => {
  // Main Tab: 'topics' vs 'cms'
  const [activeTab, setActiveTab] = useState<'topics' | 'cms'>('topics');

  // Topics state
  const [topics, setTopics] = useState<TopicDirectoryItem[]>([]);
  const [searchTopicQuery, setSearchTopicQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  // Edit Topic Modal
  const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Partial<TopicDirectoryItem> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Crop / Image Upload Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalTarget, setImageModalTarget] = useState<'topic_edit' | 'topic_quick' | 'cms'>('topic_edit');
  const [targetTopicId, setTargetTopicId] = useState<string | null>(null);
  const [targetCmsId, setTargetCmsId] = useState<string | null>(null);
  const [modalCurrentImageUrl, setModalCurrentImageUrl] = useState<string>('');

  // CMS state
  const [cmsItems, setCmsItems] = useState<CMSContentItem[]>([]);
  const [searchCmsQuery, setSearchCmsQuery] = useState('');
  const [selectedCmsSection, setSelectedCmsSection] = useState<string>('all');
  const [editingCmsValues, setEditingCmsValues] = useState<Record<string, string>>({});
  const [cmsSaveStatus, setCmsSaveStatus] = useState<Record<string, boolean>>({});

  // Notification banners
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Load Topics & CMS on mount
  useEffect(() => {
    loadTopics();
    loadCMS();
  }, []);

  const loadTopics = async () => {
    setIsLoadingTopics(true);
    const data = await fetchAdminTopicsDirectory();
    setTopics(data);
    setIsLoadingTopics(false);
  };

  const loadCMS = async () => {
    const data = await fetchCMSContent();
    setCmsItems(data);
    const initialMap: Record<string, string> = {};
    data.forEach(item => {
      initialMap[item.id] = item.value;
    });
    setEditingCmsValues(initialMap);
  };

  // 1. Topic actions
  const handleToggleActive = async (topic: TopicDirectoryItem) => {
    const updated = !topic.is_active;
    await updateTopicDirectoryItem(topic.id, { is_active: updated });
    setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, is_active: updated } : t));
    showNotification(`Card ${topic.card_number} is now ${updated ? 'Active (Visible on Homepage)' : 'Hidden'}`);
  };

  const handleMoveTopic = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= topics.length) return;

    const reordered = [...topics];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    setTopics(reordered);
    await reorderTopicsDirectory(reordered);
    showNotification('Card order updated successfully');
  };

  const handleDeleteTopic = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete topic card "${title}"?`)) return;
    await deleteTopicDirectoryItem(id);
    setTopics(prev => prev.filter(t => t.id !== id));
    showNotification('Topic card deleted');
  };

  const handleResetTopics = async () => {
    if (!window.confirm('Reset all topic cards to the official 10 WeCare Jamaica default cards? Any custom modifications will be restored.')) return;
    const restored = await resetTopicsToDefault();
    setTopics(restored);
    showNotification('Topics restored to official 10 defaults');
  };

  const handleOpenEditTopic = (topic: TopicDirectoryItem) => {
    setIsCreatingNew(false);
    setEditingTopic({ ...topic });
    setIsEditTopicModalOpen(true);
  };

  const handleOpenCreateTopic = () => {
    setIsCreatingNew(true);
    const nextNumber = topics.length + 1;
    const padded = nextNumber < 10 ? `#0${nextNumber}` : `#${nextNumber}`;
    setEditingTopic({
      id: `topic_${Date.now().toString().slice(-6)}`,
      card_number: padded,
      title: '',
      subtitle: '',
      description: '',
      category: 'Nursing & Care',
      badge_text: 'Nursing & Care',
      badge_color: 'from-blue-600 to-indigo-600 text-white',
      image_url: '/images/wound_dressing.webp',
      fallback_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400',
      tags: ['Home Care', 'Kingston'],
      is_active: true,
      sort_order: nextNumber
    });
    setIsEditTopicModalOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editingTopic.title?.trim()) {
      showNotification('Title is required', 'error');
      return;
    }

    if (isCreatingNew) {
      const created = await createTopicDirectoryItem({
        id: editingTopic.id || `topic_${Date.now()}`,
        card_number: editingTopic.card_number || `#${topics.length + 1}`,
        title: editingTopic.title.trim(),
        subtitle: editingTopic.subtitle || '',
        description: editingTopic.description || '',
        category: editingTopic.category || 'Nursing & Care',
        badge_text: editingTopic.badge_text || editingTopic.category || '',
        badge_color: editingTopic.badge_color || 'from-blue-600 to-indigo-600 text-white',
        image_url: editingTopic.image_url || '/images/wound_dressing.webp',
        fallback_url: editingTopic.fallback_url || '',
        tags: Array.isArray(editingTopic.tags) ? editingTopic.tags : [],
        is_active: editingTopic.is_active ?? true,
        sort_order: editingTopic.sort_order ?? topics.length + 1
      });
      setTopics(prev => [...prev, created]);
      showNotification('New topic card created!');
    } else {
      await updateTopicDirectoryItem(editingTopic.id!, editingTopic);
      setTopics(prev => prev.map(t => t.id === editingTopic.id ? { ...t, ...editingTopic } as TopicDirectoryItem : t));
      showNotification('Topic card updated successfully!');
    }

    setIsEditTopicModalOpen(false);
    setEditingTopic(null);
  };

  // Image upload trigger
  const handleOpenImageUploadForTopic = (topic: TopicDirectoryItem) => {
    setImageModalTarget('topic_quick');
    setTargetTopicId(topic.id);
    setModalCurrentImageUrl(topic.image_url);
    setIsImageModalOpen(true);
  };

  const handleOpenImageUploadForEditModal = () => {
    setImageModalTarget('topic_edit');
    setModalCurrentImageUrl(editingTopic?.image_url || '');
    setIsImageModalOpen(true);
  };

  const handleOpenImageUploadForCMS = (item: CMSContentItem) => {
    setImageModalTarget('cms');
    setTargetCmsId(item.id);
    setModalCurrentImageUrl(editingCmsValues[item.id] || item.value);
    setIsImageModalOpen(true);
  };

  const handleImageSaved = async (newUrl: string) => {
    if (imageModalTarget === 'topic_edit') {
      setEditingTopic(prev => prev ? { ...prev, image_url: newUrl } : null);
      showNotification('Image updated in form editor');
    } else if (imageModalTarget === 'topic_quick' && targetTopicId) {
      await updateTopicDirectoryItem(targetTopicId, { image_url: newUrl });
      setTopics(prev => prev.map(t => t.id === targetTopicId ? { ...t, image_url: newUrl } : t));
      showNotification('Card image updated and saved to database!');
    } else if (imageModalTarget === 'cms' && targetCmsId) {
      setEditingCmsValues(prev => ({ ...prev, [targetCmsId]: newUrl }));
      await updateCMSItem(targetCmsId, newUrl, currentUser?.email || 'admin');
      setCmsItems(prev => prev.map(c => c.id === targetCmsId ? { ...c, value: newUrl } : c));
      showNotification('CMS image updated and published!');
    }
  };

  // 2. CMS actions
  const handleSaveCMSItem = async (item: CMSContentItem) => {
    const value = editingCmsValues[item.id] ?? item.value;
    await updateCMSItem(item.id, value, currentUser?.email || 'admin');
    setCmsItems(prev => prev.map(c => c.id === item.id ? { ...c, value } : c));
    setCmsSaveStatus(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setCmsSaveStatus(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
    showNotification(`Published updates for "${item.title}"`);
  };

  const handleResetCMSItem = async (item: CMSContentItem) => {
    if (!window.confirm(`Reset "${item.title}" to default value?`)) return;
    await resetCMSItem(item.id);
    setEditingCmsValues(prev => ({ ...prev, [item.id]: item.default_value }));
    setCmsItems(prev => prev.map(c => c.id === item.id ? { ...c, value: item.default_value } : c));
    showNotification(`Reset "${item.title}" to default`);
  };

  // Filtered topics
  const filteredTopics = topics.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTopicQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchTopicQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTopicQuery.toLowerCase()) ||
      t.card_number.toLowerCase().includes(searchTopicQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Filtered CMS items
  const filteredCMS = cmsItems.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchCmsQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchCmsQuery.toLowerCase()) ||
      c.value.toLowerCase().includes(searchCmsQuery.toLowerCase());

    const matchesSection = selectedCmsSection === 'all' || c.section === selectedCmsSection;
    return matchesSearch && matchesSection;
  });

  const cmsSections = Array.from(new Set(cmsItems.map(c => c.section)));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Mode Tabs */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-purple-950/40 to-black/70 border border-blue-500/30 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Dynamic CMS &amp; Directory Manager
              </span>
              <span className="text-xs text-slate-400">Admin Control Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Manage Topics Directory &amp; App Content
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Customize the 10 homepage interactive topic cards, upload/crop pictures, and edit any text or image across the entire app.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'topics'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>10 Interactive Topics ({topics.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('cms')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'cms'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Global App CMS ({cmsItems.length})</span>
            </button>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
          }`}>
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 10 INTERACTIVE TOPICS DIRECTORY                                    */}
      {/* ========================================================================= */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          {/* Controls: Add, Reset, Search, Filter */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreateTopic}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Card</span>
                </button>
                <button
                  onClick={handleResetTopics}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                  title="Restore 10 official defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset to 10 Defaults</span>
                </button>
              </div>

              {/* Live Count Stats */}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong className="text-white">{topics.filter(t => t.is_active).length}</strong> Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <strong className="text-white">{topics.filter(t => !t.is_active).length}</strong> Hidden
                </span>
                <span className="text-slate-600">•</span>
                <span>Order automatically updates on drag/arrows</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-white/10">
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTopicQuery}
                  onChange={(e) => setSearchTopicQuery(e.target.value)}
                  placeholder="Filter cards by title, description or category..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                {['all', 'Special Deals', 'Home Advantage', 'Procedures', 'Supplies & Equipment', 'Safety & Escrow', 'Public Health', 'Emergency SOS', 'Reviews & Trust', 'How It Works', 'Careers & Earnings'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {isLoadingTopics ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading topics directory from database...</p>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white/[0.02] border border-white/10 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">No topics found</p>
                <p className="text-xs text-slate-400">Try clearing your search query or reset to default 10 cards.</p>
              </div>
            ) : (
              filteredTopics.map((topic, index) => (
                <div
                  key={topic.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    topic.is_active
                      ? 'bg-white/[0.03] border-white/10 hover:border-blue-500/40'
                      : 'bg-black/40 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4">
                      {/* Image Thumbnail with change overlay */}
                      <div className="relative shrink-0 w-24 h-20 sm:w-28 sm:h-22 rounded-2xl overflow-hidden bg-slate-900 border border-white/15 group">
                        <img
                          src={topic.image_url}
                          alt={topic.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (topic.fallback_url) (e.target as HTMLImageElement).src = topic.fallback_url;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleOpenImageUploadForTopic(topic)}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-white cursor-pointer"
                          title="Change / Crop Image"
                        >
                          <Upload className="w-4 h-4 text-blue-400" />
                          <span>Change</span>
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-black text-white">
                          {topic.card_number}
                        </span>
                      </div>

                      {/* Topic Title, Subtitle, Category & Tags */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${topic.badge_color || 'from-blue-600 to-indigo-600 text-white'}`}>
                            {topic.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Sort: #{topic.sort_order}
                          </span>
                          {!topic.is_active && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                              Hidden
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                          {topic.title}
                        </h4>

                        <p className="text-xs text-slate-300 line-clamp-1">
                          {topic.subtitle}
                        </p>

                        {/* Description Preview */}
                        {topic.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                            "{topic.description}"
                          </p>
                        )}

                        {/* Tags Preview */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {topic.tags?.slice(0, 4).map((tag, tIdx) => (
                            <span key={tIdx} className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[9px] text-slate-400 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      {/* Move Order buttons */}
                      <div className="flex items-center bg-black/40 rounded-xl border border-white/10 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveTopic(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 transition cursor-pointer"
                          title="Move card up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTopic(index, 'down')}
                          disabled={index === topics.length - 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 transition cursor-pointer"
                          title="Move card down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Change Image Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenImageUploadForTopic(topic)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                        title="Upload/crop image"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Image</span>
                      </button>

                      {/* Hide/Show Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(topic)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                          topic.is_active
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                        title={topic.is_active ? 'Click to hide card from homepage' : 'Click to show card on homepage'}
                      >
                        {topic.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{topic.is_active ? 'Active' : 'Hidden'}</span>
                      </button>

                      {/* Edit Details */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditTopic(topic)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white text-xs font-bold border border-blue-500/40 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTopic(topic.id, topic.title)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition cursor-pointer"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GLOBAL APP CMS CONTENT (ALL SITE TEXT, NUMBERS & IMAGES)          */}
      {/* ========================================================================= */}
      {activeTab === 'cms' && (
        <div className="space-y-6">
          {/* Controls: Search, Section Filter */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Full Application CMS Editor</h3>
                <p className="text-xs text-slate-400">Modify any headline, promo voucher, address, or image. Updates publish immediately.</p>
              </div>

              {/* Reset All CMS button */}
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm('Reset all CMS content items to factory defaults?')) return;
                  for (const c of cmsItems) {
                    await resetCMSItem(c.id);
                  }
                  await loadCMS();
                  showNotification('All CMS content reset to defaults');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset All Defaults</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-white/10">
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCmsQuery}
                  onChange={(e) => setSearchCmsQuery(e.target.value)}
                  placeholder="Search content by title, section or current text..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Section selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                <button
                  onClick={() => setSelectedCmsSection('all')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCmsSection === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  All Sections
                </button>
                {cmsSections.map(sec => (
                  <button
                    key={sec}
                    onClick={() => setSelectedCmsSection(sec)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedCmsSection === sec
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CMS Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCMS.map((item) => {
              const currentValue = editingCmsValues[item.id] ?? item.value;
              const hasChanged = currentValue !== item.value;
              const isSaved = cmsSaveStatus[item.id];

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.section}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.id}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-slate-400">{item.description}</p>
                      )}
                    </div>

                    {/* Field Editor by Content Type */}
                    {item.content_type === 'image' ? (
                      <div className="space-y-2 pt-2">
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-950 border border-white/15">
                          <img
                            src={currentValue}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={currentValue}
                            onChange={(e) => setEditingCmsValues(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono"
                            placeholder="https://..."
                          />
                          <button
                            type="button"
                            onClick={() => handleOpenImageUploadForCMS(item)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 text-xs font-bold border border-blue-500/40 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Crop/Upload</span>
                          </button>
                        </div>
                      </div>
                    ) : item.content_type === 'textarea' ? (
                      <div className="pt-2">
                        <textarea
                          rows={3}
                          value={currentValue}
                          onChange={(e) => setEditingCmsValues(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 transition"
                        />
                      </div>
                    ) : (
                      <div className="pt-2">
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => setEditingCmsValues(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 transition"
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer: Save & Reset */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => handleResetCMSItem(item)}
                      className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                      title="Reset to default"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>Reset</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveCMSItem(item)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-600 text-white'
                          : hasChanged
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSaved ? 'Published!' : hasChanged ? 'Save & Publish' : 'Update'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CREATE TOPIC MODAL                                                 */}
      {/* ========================================================================= */}
      {isEditTopicModalOpen && editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {isCreatingNew ? 'Create New Topic Card' : `Edit Topic Card ${editingTopic.card_number}`}
                  </h3>
                  <p className="text-xs text-slate-400">Card details update on the homepage in real time</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTopicModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4">
              {/* Card Number & Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Card Number Badge</label>
                  <input
                    type="text"
                    value={editingTopic.card_number || ''}
                    onChange={(e) => setEditingTopic({ ...editingTopic, card_number: e.target.value })}
                    placeholder="#01, #02..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Sort Order</label>
                  <input
                    type="number"
                    value={editingTopic.sort_order ?? 1}
                    onChange={(e) => setEditingTopic({ ...editingTopic, sort_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                    required
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Headline Title</label>
                <input
                  type="text"
                  value={editingTopic.title || ''}
                  onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                  placeholder="e.g. Exclusive Health Care Promotions & Advertisements"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                  required
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Subtitle / Quick Summary</label>
                <input
                  type="text"
                  value={editingTopic.subtitle || ''}
                  onChange={(e) => setEditingTopic({ ...editingTopic, subtitle: e.target.value })}
                  placeholder="1-sentence plain-language summary for quick reading..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                  required
                />
              </div>

              {/* Category & Badge Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={editingTopic.category || 'Special Deals'}
                    onChange={(e) => setEditingTopic({ 
                      ...editingTopic, 
                      category: e.target.value,
                      badge_text: e.target.value
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                  >
                    <option value="Special Deals">Special Deals</option>
                    <option value="Home Advantage">Home Advantage</option>
                    <option value="Procedures">Procedures</option>
                    <option value="Supplies & Equipment">Supplies &amp; Equipment</option>
                    <option value="Safety & Escrow">Safety &amp; Escrow</option>
                    <option value="Public Health">Public Health</option>
                    <option value="Emergency SOS">Emergency SOS</option>
                    <option value="Reviews & Trust">Reviews &amp; Trust</option>
                    <option value="How It Works">How It Works</option>
                    <option value="Careers & Earnings">Careers &amp; Earnings</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Badge Color Style</label>
                  <select
                    value={editingTopic.badge_color || 'from-blue-600 to-indigo-600 text-white'}
                    onChange={(e) => setEditingTopic({ ...editingTopic, badge_color: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                  >
                    <option value="from-amber-500 to-orange-500 text-slate-950">Amber Gold (Deals)</option>
                    <option value="from-rose-500 to-pink-500 text-white">Rose Red (Home)</option>
                    <option value="from-blue-600 to-indigo-600 text-white">Electric Blue (Procedures)</option>
                    <option value="from-emerald-500 to-teal-500 text-slate-950">Emerald Green (Supplies)</option>
                    <option value="from-purple-600 to-indigo-600 text-white">Royal Purple (Escrow)</option>
                    <option value="from-sky-500 to-blue-600 text-white">Sky Blue (Health News)</option>
                    <option value="from-red-600 to-rose-600 text-white">Crimson Alert (119 SOS)</option>
                    <option value="from-amber-400 to-yellow-500 text-slate-950">Yellow Star (Reviews)</option>
                    <option value="from-cyan-500 to-blue-600 text-white">Cyan Wave (How It Works)</option>
                  </select>
                </div>
              </div>

              {/* Image URL & Upload / Crop Button */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Card Picture Beside Title</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenImageUploadForEditModal}
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload &amp; Crop New Image</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-950 border border-white/20 shrink-0">
                    <img
                      src={editingTopic.image_url || '/images/wound_dressing.webp'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    value={editingTopic.image_url || ''}
                    onChange={(e) => setEditingTopic({ ...editingTopic, image_url: e.target.value })}
                    placeholder="/images/... or https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Detailed Description</label>
                <textarea
                  rows={3}
                  value={editingTopic.description || ''}
                  onChange={(e) => setEditingTopic({ ...editingTopic, description: e.target.value })}
                  placeholder="Comprehensive description when user clicks or views this topic..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                />
              </div>

              {/* Tags (comma separated) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Highlight Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingTopic.tags?.join(', ') || ''}
                  onChange={(e) => {
                    const splitted = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setEditingTopic({ ...editingTopic, tags: splitted });
                  }}
                  placeholder="e.g. 0 Min Wait Time, Zero Contagion, No Taxi Gridlock"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div>
                  <span className="text-xs font-bold text-white block">Active on Homepage</span>
                  <span className="text-[11px] text-slate-400">If unchecked, this card is hidden from clients</span>
                </div>
                <input
                  type="checkbox"
                  checked={editingTopic.is_active ?? true}
                  onChange={(e) => setEditingTopic({ ...editingTopic, is_active: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{isCreatingNew ? 'Create Card' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMAGE UPLOAD & CROP MODAL                                                 */}
      {/* ========================================================================= */}
      <ImageUploadCropModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSaved={handleImageSaved}
        currentImageUrl={modalCurrentImageUrl}
        title="Upload, Crop &amp; Resize Picture"
        defaultAspectRatio="16:9"
      />
    </div>
  );
};
