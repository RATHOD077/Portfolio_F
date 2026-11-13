"use client";
import React, { useEffect, useMemo, useState } from 'react';
import api, { getImageUrl } from '@/lib/api';
import { Card, Button, Badge } from '@/components/ui';
import { PlusCircle, Edit3, Trash2, Save, X, Loader2, Quote, Eye, EyeOff, Star, ImagePlus, Link2 } from 'lucide-react';

// Client testimonials: published ones show on the home page; one linked to a
// project also shows on that project's page.

const EMPTY = {
  id: null,
  name: '',
  role: '',
  company: '',
  quote: '',
  rating: '',
  project_id: '',
  published: true,
  sort_order: 0,
  avatar_url: '',
};

const inputClass =
  'bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary transition-all font-semibold';
const labelClass = 'text-[9px] font-black uppercase tracking-widest text-white/40 ml-0.5';

const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

function Avatar({ name, url, size = 'w-10 h-10' }) {
  return url ? (
    // Plain <img>: also shows local previews (blob: URLs) of a photo not uploaded yet.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url.startsWith('blob:') ? url : getImageUrl(url)} alt={name} className={`${size} rounded-full object-cover border border-white/10 shrink-0`} />
  ) : (
    <div className={`${size} rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[11px] font-black shrink-0`}>
      {initials(name || '?')}
    </div>
  );
}

function Stars({ rating }) {
  if (!rating) return <span className="text-[10px] text-white/20 font-bold">No rating</span>;
  return (
    <span className="flex gap-0.5" title={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={11} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />
      ))}
    </span>
  );
}

const TestimonialsManagement = () => {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState(null); // new File chosen in the form
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    const [{ data: list }, { data: projectList }] = await Promise.all([
      api.get('/testimonials/all'),
      api.get('/projects').catch(() => ({ data: { data: [] } })),
    ]);
    return { items: list.data || [], projects: projectList.data || [] };
  };

  const apply = (result) => {
    setItems(result.items);
    setProjects(result.projects);
  };

  const load = () => fetchAll().then(apply).catch((err) => setError(err.message || 'Could not load testimonials.'));

  useEffect(() => {
    let active = true;
    fetchAll()
      .then((result) => active && apply(result))
      .catch((err) => active && setError(err.message || 'Could not load testimonials.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Preview of a newly chosen photo (released again when it changes).
  const photoUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : ''), [photo]);
  useEffect(() => () => photoUrl && URL.revokeObjectURL(photoUrl), [photoUrl]);

  const openAdd = () => {
    setForm(EMPTY);
    setPhoto(null);
    setRemovePhoto(false);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setForm({
      id: t.id,
      name: t.name || '',
      role: t.role || '',
      company: t.company || '',
      quote: t.quote || '',
      rating: t.rating ? String(t.rating) : '',
      project_id: t.project_id ? String(t.project_id) : '',
      published: Boolean(t.published),
      sort_order: t.sort_order || 0,
      avatar_url: t.avatar_url || '',
    });
    setPhoto(null);
    setRemovePhoto(false);
    setError('');
    setModalOpen(true);
  };

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError("Add the client's name.");
    if (form.quote.trim().length < 10) return setError('The testimonial needs at least 10 characters.');

    const body = new FormData();
    for (const key of ['name', 'role', 'company', 'quote', 'rating', 'project_id', 'sort_order']) {
      body.append(key, String(form[key] ?? ''));
    }
    body.append('published', form.published ? 'true' : 'false');
    if (photo) body.append('avatar', photo);
    else if (removePhoto) body.append('remove_avatar', 'true');

    setSaving(true);
    try {
      if (form.id) await api.put(`/testimonials/${form.id}`, body);
      else await api.post('/testimonials', body);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message || 'Could not save the testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (t) => {
    try {
      await api.put(`/testimonials/${t.id}`, { published: !t.published });
      setItems((list) => list.map((x) => (x.id === t.id ? { ...x, published: t.published ? 0 : 1 } : x)));
    } catch (err) {
      alert(err.message || 'Could not update it.');
    }
  };

  const remove = async (t) => {
    if (!confirm(`Delete the testimonial from ${t.name}?`)) return;
    try {
      await api.delete(`/testimonials/${t.id}`);
      setItems((list) => list.filter((x) => x.id !== t.id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  if (loading) {
    return <div className="text-3xl font-black text-white animate-pulse p-20 text-center tracking-tighter italic">Loading testimonials...</div>;
  }

  const previewUrl = photoUrl || (removePhoto ? '' : form.avatar_url);
  const publishedCount = items.filter((t) => t.published).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[9px] tracking-[0.2em] mb-1">
            <span className="w-6 h-0.5 bg-primary/20 rounded-full" />
            Social Proof
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Client Testimonials</h1>
        </div>
        <Button onClick={openAdd} variant="primary" className="btn-premium px-3.5 py-2 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 rounded-lg shadow-lg">
          <PlusCircle size={14} strokeWidth={2.5} /> Add Testimonial
        </Button>
      </div>

      <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 text-[11px] font-semibold text-white/60 leading-relaxed">
        <span className="text-white font-black">{publishedCount} published</span> · shown on the home page (in “Order”, lowest first).
        Link one to a project and it also appears on that project&apos;s page. Ask happy clients for 2–3 sentences about the result.
      </div>

      {error && !modalOpen && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs font-bold text-red-300">{error}</div>
      )}

      {/* List */}
      <div className="grid gap-3">
        {items.map((t) => (
          <Card key={t.id} className="p-4 border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 md:w-56 shrink-0">
              <Avatar name={t.name} url={t.avatar_url} />
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{t.name}</p>
                <p className="text-[10px] font-bold text-white/35 truncate mt-0.5">{[t.role, t.company].filter(Boolean).join(' · ') || '—'}</p>
              </div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed flex-1 line-clamp-2 italic">“{t.quote}”</p>
            <div className="flex flex-wrap items-center gap-2.5 md:justify-end shrink-0">
              <Stars rating={t.rating} />
              {t.project_title && (
                <Badge variant="primary" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                  <Link2 size={10} /> {t.project_title}
                </Badge>
              )}
              <span className="text-[10px] font-bold text-white/30">#{t.sort_order}</span>
              <button
                onClick={() => togglePublished(t)}
                title={t.published ? 'Published — click to hide' : 'Hidden — click to publish'}
                className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                  t.published ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/35'
                }`}
              >
                {t.published ? <Eye size={11} /> : <EyeOff size={11} />} {t.published ? 'Live' : 'Hidden'}
              </button>
              <button onClick={() => openEdit(t)} className="p-2 bg-white/5 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all border border-white/5" title="Edit">
                <Edit3 size={12} />
              </button>
              <button onClick={() => remove(t)} className="p-2 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all border border-white/5" title="Delete">
                <Trash2 size={12} />
              </button>
            </div>
          </Card>
        ))}
        {items.length === 0 && (
          <Card className="p-10 border-white/5 bg-white/5 text-center">
            <Quote className="mx-auto text-primary/40" size={28} />
            <p className="text-sm font-black text-white mt-3">No testimonials yet</p>
            <p className="text-xs text-white/40 mt-1">Add your first one — the section appears on the home page as soon as one is published.</p>
          </Card>
        )}
      </div>

      {/* Add / edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/75 backdrop-blur-xl animate-fade-in">
          <Card className="w-full max-w-lg max-h-[92vh] overflow-y-auto border-white/10 bg-[#050b18] shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Quote className="text-primary" size={18} /> {form.id ? 'Edit Testimonial' : 'New Testimonial'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white transition-colors p-1.5 bg-white/5 rounded-lg border border-white/5">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={save} className="flex flex-col gap-4">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <Avatar name={form.name} url={previewUrl} size="w-16 h-16" />
                <div className="flex flex-col gap-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:border-primary transition-all w-fit">
                    <ImagePlus size={12} /> {previewUrl ? 'Change photo' : 'Add photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        setPhoto(e.target.files?.[0] || null);
                        setRemovePhoto(false);
                      }}
                    />
                  </label>
                  {previewUrl && (
                    <button type="button" onClick={() => { setPhoto(null); setRemovePhoto(true); }} className="text-[10px] font-bold text-white/35 hover:text-red-300 text-left">
                      Remove photo
                    </button>
                  )}
                  <span className="text-[9px] text-white/25 font-semibold">Optional · shown small and round · without one, their initials are used</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Client name *</label>
                <input name="name" value={form.name} onChange={change} required maxLength={120} className={inputClass} placeholder="e.g. Priya Sharma" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Role</label>
                  <input name="role" value={form.role} onChange={change} maxLength={160} className={inputClass} placeholder="Founder" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Company</label>
                  <input name="company" value={form.company} onChange={change} maxLength={160} className={inputClass} placeholder="Navruchi Foods" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>What they said * ({form.quote.trim().length}/1200)</label>
                <textarea
                  name="quote"
                  value={form.quote}
                  onChange={change}
                  rows={5}
                  maxLength={1200}
                  required
                  className={`${inputClass} resize-none leading-relaxed`}
                  placeholder="Sachin built our online store in three weeks. Orders doubled in the first month and he's always quick to help."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Rating</label>
                  <select name="rating" value={form.rating} onChange={change} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="" className="bg-[#020817]">No stars</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n} className="bg-[#020817]">{'★'.repeat(n)} ({n})</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Order</label>
                  <input type="number" name="sort_order" value={form.sort_order} onChange={change} min="0" className={inputClass} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>About which project? (optional)</label>
                <select name="project_id" value={form.project_id} onChange={change} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="" className="bg-[#020817]">Not linked to a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#020817]">{p.title}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2.5 text-xs font-bold text-white/70 cursor-pointer select-none">
                <input type="checkbox" name="published" checked={form.published} onChange={change} className="accent-primary w-4 h-4" />
                Show it on the website
              </label>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-[11px] font-bold text-red-300">{error}</div>
              )}

              <div className="flex gap-2.5 border-t border-white/10 pt-4 mt-1">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="bg-white/5 border-white/5 grow py-2 text-xs font-bold text-white/40 hover:text-white rounded-lg">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} variant="primary" className="btn-premium grow py-2 text-[11px] font-black flex items-center justify-center gap-2 rounded-lg">
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <><Save size={14} /> Save</>}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManagement;
