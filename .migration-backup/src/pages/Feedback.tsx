import { useState, useEffect, useCallback } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageSquarePlus, Send, Sparkles, CheckCircle2, Lightbulb, Palette,
  Zap, Brain, HelpCircle, BarChart3, TrendingUp, Users, ThumbsUp, Clock, Plus,
  MessageCircle, ChevronDown, ChevronUp, Shield,
} from "lucide-react";

const CREATOR_EMAIL = "yerzhanuly.y@nisa.edu.kz";

const categories = [
  { id: 'general', icon: Lightbulb, color: 'from-amber-500 to-orange-500' },
  { id: 'ui', icon: Palette, color: 'from-pink-500 to-rose-500' },
  { id: 'features', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { id: 'ai', icon: Brain, color: 'from-purple-500 to-violet-500' },
  { id: 'other', icon: HelpCircle, color: 'from-gray-500 to-slate-500' },
];

interface Reply {
  id: string;
  reply_text: string;
  author_name: string | null;
  is_creator: boolean;
  created_at: string;
}

interface Suggestion {
  id: string;
  name: string | null;
  category: string | null;
  suggestion: string;
  suggestion_en?: string | null;
  suggestion_ru?: string | null;
  suggestion_kk?: string | null;
  suggestion_zh?: string | null;
  original_lang?: string | null;
  created_at: string;
  likes_count: number;
  liked_by_me: boolean;
  replies: Reply[];
}

function getVisitorId(): string {
  let id = localStorage.getItem('medai-visitor-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('medai-visitor-id', id);
  }
  return id;
}

export default function Feedback() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, byCategory: {} as Record<string, number> });
  const [formData, setFormData] = useState({
    name: '', email: '', category: 'general', suggestion: '',
  });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [submittingReply, setSubmittingReply] = useState(false);

  const visitorId = getVisitorId();
  const isCreator = !!user && user.email === CREATOR_EMAIL;

  const fetchAllPages = async (table: string, select: string) => {
    let all: any[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from(table as any)
        .select(select)
        .range(from, from + pageSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      all = all.concat(data);
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return all;
  };

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allSuggestions, allLikes, allReplies] = await Promise.all([
        fetchAllPages('suggestions_public' as any, 'id, name, category, suggestion, suggestion_en, suggestion_ru, suggestion_kk, suggestion_zh, original_lang, created_at'),
        fetchAllPages('suggestion_likes', 'suggestion_id, visitor_id'),
        fetchAllPages('suggestion_replies', 'id, suggestion_id, reply_text, author_name, is_creator, created_at'),
      ]);

      const likesMap: Record<string, { count: number; myLike: boolean }> = {};
      allLikes.forEach((like: { suggestion_id: string; visitor_id: string }) => {
        if (!likesMap[like.suggestion_id]) likesMap[like.suggestion_id] = { count: 0, myLike: false };
        likesMap[like.suggestion_id].count++;
        if (like.visitor_id === visitorId) likesMap[like.suggestion_id].myLike = true;
      });

      const repliesMap: Record<string, Reply[]> = {};
      allReplies.forEach((r: any) => {
        if (!repliesMap[r.suggestion_id]) repliesMap[r.suggestion_id] = [];
        repliesMap[r.suggestion_id].push({
          id: r.id,
          reply_text: r.reply_text,
          author_name: r.author_name,
          is_creator: r.is_creator,
          created_at: r.created_at,
        });
      });

      const mapped: Suggestion[] = allSuggestions.map((s) => ({
        ...s,
        likes_count: likesMap[s.id]?.count || 0,
        liked_by_me: likesMap[s.id]?.myLike || false,
        replies: (repliesMap[s.id] || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      }));

      mapped.sort((a, b) => b.likes_count - a.likes_count);
      setSuggestions(mapped);

      const byCategory: Record<string, number> = {};
      categories.forEach(cat => byCategory[cat.id] = 0);
      mapped.forEach(item => {
        const cat = item.category || 'general';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });
      setStats({ total: mapped.length, byCategory });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [visitorId]);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const getCategoryLabel = (id: string) => {
    const labels: Record<string, string> = {
      general: t('catGeneral'), ui: t('catUI'), features: t('catFeatures'),
      ai: t('catAI'), other: t('catOther'),
    };
    return labels[id] || id;
  };

  const getCategoryInfo = (id: string) => categories.find(c => c.id === id) || categories[0];

  const handleLike = async (suggestionId: string, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        await supabase.from('suggestion_likes').delete().eq('suggestion_id', suggestionId).eq('visitor_id', visitorId);
      } else {
        await supabase.from('suggestion_likes').insert({ suggestion_id: suggestionId, visitor_id: visitorId });
      }
      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId
            ? { ...s, liked_by_me: !currentlyLiked, likes_count: s.likes_count + (currentlyLiked ? -1 : 1) }
            : s
        ).sort((a, b) => b.likes_count - a.likes_count)
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleReply = async (suggestionId: string) => {
    const text = replyText.trim().replace(/<[^>]*>/g, "");
    if (!text || text.length < 2) return;
    if (text.length > 1000) {
      toast({ title: "Reply too long (max 1000 chars)", variant: "destructive" });
      return;
    }
    setSubmittingReply(true);
    try {
      const name = replyName.trim().replace(/<[^>]*>/g, "").slice(0, 100) || null;
      
      if (isCreator) {
        // Use SECURITY DEFINER function for creator replies
        const { error } = await supabase.rpc('insert_creator_reply' as any, {
          p_suggestion_id: suggestionId,
          p_reply_text: text,
          p_author_name: 'MedAI+ Team',
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('suggestion_replies' as any).insert({
          suggestion_id: suggestionId,
          reply_text: text,
          author_name: name,
          is_creator: false,
          visitor_id: visitorId,
        });
        if (error) throw error;
      }

      const newReply: Reply = {
        id: crypto.randomUUID(),
        reply_text: text,
        author_name: isCreator ? 'MedAI+ Team' : name,
        is_creator: isCreator,
        created_at: new Date().toISOString(),
      };

      setSuggestions(prev => prev.map(s =>
        s.id === suggestionId ? { ...s, replies: [...s.replies, newReply] } : s
      ));
      setExpandedReplies(prev => new Set(prev).add(suggestionId));
      setReplyText('');
      setReplyName('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({ title: "Failed to submit reply", variant: "destructive" });
    } finally {
      setSubmittingReply(false);
    }
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const suggestion = formData.suggestion.trim().replace(/<[^>]*>/g, "");
    if (!suggestion || suggestion.length < 3) {
      toast({ title: t('errorEnterSuggestion'), variant: "destructive" });
      return;
    }
    if (suggestion.length > 2000) {
      toast({ title: "Suggestion too long (max 2000 chars)", variant: "destructive" });
      return;
    }
    const name = formData.name.trim().replace(/<[^>]*>/g, "").slice(0, 100);
    const email = formData.email.trim().slice(0, 255);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email address", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Translate to other 3 languages via edge function (best-effort, non-blocking on failure)
      let translations: Record<string, string> = { [language]: suggestion };
      try {
        const { data: tr } = await supabase.functions.invoke('translate-suggestion', {
          body: { text: suggestion, sourceLang: language },
        });
        if (tr?.translations) translations = { ...translations, ...tr.translations };
      } catch (e) {
        console.warn('Translation skipped:', e);
      }

      const { error } = await supabase.from('suggestions').insert({
        name: name || null,
        email: email || null,
        category: formData.category,
        suggestion,
        suggestion_en: translations.en || (language === 'en' ? suggestion : null),
        suggestion_ru: translations.ru || (language === 'ru' ? suggestion : null),
        suggestion_kk: translations.kk || (language === 'kk' ? suggestion : null),
        suggestion_zh: translations.zh || (language === 'zh' ? suggestion : null),
        original_lang: language,
      });
      if (error) throw error;
      setIsSubmitted(true);
      toast({ title: t('thankYou'), description: t('yourFeedbackHelps') });
      setTimeout(() => {
        setIsSubmitted(false);
        setShowForm(false);
        setFormData({ name: '', email: '', category: 'general', suggestion: '' });
        fetchSuggestions();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({ title: t('errorSubmitFailed'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const weekCount = suggestions.filter(f => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(f.created_at) > weekAgo;
  }).length;

  const topCategory = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';

  const [displayCount, setDisplayCount] = useState(50);
  const displayedSuggestions = suggestions.slice(0, displayCount);

  return (
    <Layout>
      <SEOHead title="Feedback" description="Share your suggestions to improve MedAI+. View community feedback and vote on ideas." path="/feedback" />
      <div className="container py-12 md:py-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-semibold mb-6">
            <MessageSquarePlus className="h-4 w-4 text-primary" />
            <span className="text-gradient">{t('feedback')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{t('feedbackTitle')}</h1>
          <p className="text-lg text-muted-foreground">{t('feedbackDescription')}</p>
          {isCreator && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-500">{t('creatorBadge')} Mode</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">{t('feedbackStats')}</h2>
                  <p className="text-xs text-muted-foreground">{t('feedbackStatsDescription')}</p>
                </div>
              </div>
              <Button onClick={() => setShowForm(!showForm)} className="gradient-primary text-white rounded-xl">
                <Plus className="mr-1.5 h-4 w-4" />{t('addSuggestion')}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{t('totalSuggestions')}</span>
                </div>
                <p className="font-display text-2xl font-bold text-gradient">{stats.total}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-muted-foreground">{t('thisWeek')}</span>
                </div>
                <p className="font-display text-2xl font-bold text-emerald-500">{weekCount}</p>
              </div>
              <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span className="text-xs font-medium text-muted-foreground">{t('mostPopular')}</span>
                </div>
                <p className="font-display text-sm font-bold text-violet-500">{getCategoryLabel(topCategory)}</p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = stats.byCategory[cat.id] || 0;
                return (
                  <div key={cat.id} className="p-2 rounded-xl bg-muted/50 text-center">
                    <div className={`w-8 h-8 mx-auto mb-1 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground">{getCategoryLabel(cat.id)}</p>
                    <p className="font-display text-sm font-bold text-foreground">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-10">
            {isSubmitted ? (
              <div className="glass-card rounded-3xl p-10 text-center animate-scale-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">{t('thankYou')}</h2>
                <p className="text-muted-foreground">{t('yourFeedbackHelps')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('yourName')}</label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="rounded-xl border-border/50 bg-background/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('yourEmail')}</label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" className="rounded-xl border-border/50 bg-background/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">{t('category')}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.category === cat.id;
                      return (
                        <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${isSelected ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50'}`}>
                          <div className={`w-8 h-8 mx-auto mb-1 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{getCategoryLabel(cat.id)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('suggestion')} *</label>
                  <Textarea value={formData.suggestion} onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })} placeholder={t('suggestionPlaceholder')} rows={4} className="rounded-xl border-border/50 bg-background/50 resize-none" required />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl gradient-primary text-white font-semibold text-lg">
                  {isSubmitting ? (<><Sparkles className="mr-2 h-5 w-5 animate-spin" />{t('loading')}</>) : (<><Send className="mr-2 h-5 w-5" />{t('submitSuggestion')}</>)}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Public Suggestions List */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <MessageSquarePlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">{t('allSuggestions')}</h2>
              <p className="text-xs text-muted-foreground">{t('allSuggestionsDesc')}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <div className="h-6 w-6 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <p className="text-muted-foreground">{t('noSuggestionsYet')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedSuggestions.map((s) => {
                const catInfo = getCategoryInfo(s.category || 'general');
                const CatIcon = catInfo.icon;
                const isExpanded = expandedReplies.has(s.id);
                const hasCreatorReply = s.replies.some(r => r.is_creator);
                return (
                  <div key={s.id} className={`glass-card rounded-2xl p-5 transition-all hover:shadow-md ${hasCreatorReply ? 'ring-1 ring-emerald-500/30' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${catInfo.color} flex items-center justify-center`}>
                        <CatIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-foreground">{s.name || t('anonymous')}</span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">{getCategoryLabel(s.category || 'general')}</span>
                          {hasCreatorReply && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold flex items-center gap-1">
                              <Shield className="h-3 w-3" /> {t('creatorBadge')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80 mb-2">
                          {(language === 'ru' && s.suggestion_ru) ||
                            (language === 'en' && s.suggestion_en) ||
                            (language === 'kk' && s.suggestion_kk) ||
                            (language === 'zh' && s.suggestion_zh) ||
                            s.suggestion}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(s.created_at)}</span>
                          {s.replies.length > 0 && (
                            <button onClick={() => toggleReplies(s.id)} className="flex items-center gap-1 hover:text-primary transition-colors">
                              <MessageCircle className="h-3 w-3" />
                              {s.replies.length} {t('replies')}
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}
                          <button
                            onClick={() => setReplyingTo(replyingTo === s.id ? null : s.id)}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <MessageCircle className="h-3 w-3" />
                            {t('reply')}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLike(s.id, s.liked_by_me)}
                        className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                          s.liked_by_me ? 'bg-primary/15 text-primary' : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        <ThumbsUp className={`h-5 w-5 ${s.liked_by_me ? 'fill-primary' : ''}`} />
                        <span className="text-xs font-bold">{s.likes_count}</span>
                      </button>
                    </div>

                    {/* Replies */}
                    {isExpanded && s.replies.length > 0 && (
                      <div className="mt-4 ml-14 space-y-3 border-l-2 border-border/50 pl-4">
                        {s.replies.map((r) => (
                          <div key={r.id} className={`p-3 rounded-xl ${r.is_creator ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-muted/30'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold ${r.is_creator ? 'text-emerald-600' : 'text-foreground'}`}>
                                {r.author_name || t('anonymous')}
                              </span>
                              {r.is_creator && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center gap-0.5">
                                  <Shield className="h-2.5 w-2.5" /> {t('creatorBadge')}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">{formatDate(r.created_at)}</span>
                            </div>
                            <p className="text-sm text-foreground/80">{r.reply_text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === s.id && (
                      <div className="mt-4 ml-14 space-y-2">
                        {!isCreator && (
                          <Input
                            value={replyName}
                            onChange={(e) => setReplyName(e.target.value)}
                            placeholder={t('yourName')}
                            className="rounded-xl border-border/50 bg-background/50 h-9 text-sm"
                          />
                        )}
                        <div className="flex gap-2">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t('replyPlaceholder')}
                            rows={2}
                            className="rounded-xl border-border/50 bg-background/50 resize-none text-sm flex-1"
                          />
                          <Button
                            size="sm"
                            disabled={submittingReply || !replyText.trim()}
                            onClick={() => handleReply(s.id)}
                            className={`rounded-xl self-end ${isCreator ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'gradient-primary text-white'}`}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        {isCreator && (
                          <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> {t('creatorBadge')} · your reply will be highlighted
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {displayCount < suggestions.length && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => setDisplayCount(prev => prev + 50)} className="rounded-xl">
                    {t('viewAllSuggestions')} ({displayCount}/{suggestions.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
