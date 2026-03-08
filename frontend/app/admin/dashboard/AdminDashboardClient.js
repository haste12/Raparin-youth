'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const EMPTY_FORM = {
  titleEn: '', titleKu: '', date: '', shortDescEn: '', shortDescKu: '',
  contentEn: '', contentKu: '', coverImage: null, images: [],
  icon: '📌', color: '#33AAFF', youtubeUrl: '',
};

// ─── Rich Text Editor ────────────────────────────────────────────────────────
const RICH_COLORS = ['#0D2244','#1E3A5F','#F87171','#FB923C','#FBBF24','#4ADE80','#38BDF8','#818CF8','#F472B6','#FFFFFF'];

function RichEditor({ value, onChangeHTML, placeholder, darkMode }) {
  const editorRef = useRef(null);
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || '';
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function exec(cmd, val = null) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    onChangeHTML(editorRef.current.innerHTML);
  }

  return (
    <div className={`rich-wrap${darkMode ? '' : ' rich-light'}`}>
      <div className="rich-toolbar">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} className="rich-btn rich-b" title="Bold">B</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} className="rich-btn rich-i" title="Italic">I</button>
        <div className="rich-sep" />
        {RICH_COLORS.map(c => (
          <button key={c} type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('foreColor', c); }}
            className="rich-dot" style={{ background: c }}
            title={c}
          />
        ))}
        <div className="rich-sep" />
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }} className="rich-btn" title="پاکردنەوەی فۆرمێت">✕</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        dir="rtl"
        suppressContentEditableWarning
        onInput={() => onChangeHTML(editorRef.current.innerHTML)}
        data-placeholder={placeholder}
        className="rich-editor"
      />
    </div>
  );
}

// ─── Image Upload helper ──────────────────────────────────────────────────────
async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.error || 'بارکردن شکستی هێنا');
  }
  const d = await res.json();
  return d.url;
}

// ─── Activity Form Modal ──────────────────────────────────────────────────────
function ActivityFormModal({ initial, onSave, onClose, saving, darkMode }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [coverPreview, setCoverPreview] = useState(initial?.coverImage || null);
  const [imgPreviews, setImgPreviews] = useState(initial?.images || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const coverRef = useRef();
  const imagesRef = useRef();

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, coverImage: url }));
      setCoverPreview(url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleImagesChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 5 - imgPreviews.length;
    if (remaining <= 0) { setUploadError('گەیشتیت بە زۆرترین ٥ وێنە.'); return; }
    const toUpload = files.slice(0, remaining);
    setUploadError('');
    setUploading(true);
    try {
      const urls = await Promise.all(toUpload.map(uploadFile));
      const updated = [...imgPreviews, ...urls];
      setImgPreviews(updated);
      setForm((f) => ({ ...f, images: updated }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx) {
    const updated = imgPreviews.filter((_, i) => i !== idx);
    setImgPreviews(updated);
    setForm((f) => ({ ...f, images: updated }));
  }

  function removeCover() {
    setForm((f) => ({ ...f, coverImage: null }));
    setCoverPreview(null);
    if (coverRef.current) coverRef.current.value = '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      titleEn: form.titleEn?.trim() || form.titleKu,
      shortDescEn: form.shortDescEn?.trim() || form.shortDescKu,
      contentEn: form.contentEn?.trim() || form.contentKu,
    });
  }

  return (
    <div style={modal.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal.box} className="modal-box-r">
        {/* Modal header */}
        <div style={modal.header} className="modal-header-r">
          <h2 style={modal.title} className="modal-title-r">{initial ? 'دەستکاریکردنی چالاکییەکە' : 'چالاکیی نوێ'}</h2>
          <button onClick={onClose} style={modal.closeBtn} aria-label="داخستن"><CloseIcon /></button>
        </div>

        <form onSubmit={handleSubmit} style={modal.form} className="modal-form-r">
          {/* Kurdish Title */}
          <div style={modal.field}>
            <label style={modal.label}>ناوی چالاکییەکە <span style={modal.req}>*</span></label>
            <input value={form.titleKu} onChange={set('titleKu')} style={{ ...modal.input, direction: 'rtl', textAlign: 'right' }} placeholder="ناوی چالاکییەکە بە کوردی" required />
          </div>

          {/* Date */}
          <div style={{ maxWidth: '220px' }} className="form-date-r">
            <label style={modal.label}>بەروار <span style={modal.req}>*</span></label>
            <input type="date" value={form.date} onChange={set('date')} style={modal.input} required />
          </div>

          {/* Short Desc KU */}
          <div style={modal.field}>
            <label style={modal.label}>کورتی پێناسەکە <span style={modal.req}>*</span></label>
            <textarea value={form.shortDescKu} onChange={set('shortDescKu')} style={{ ...modal.input, ...modal.textarea, minHeight: '80px', direction: 'rtl', textAlign: 'right' }} placeholder="کورتی پێناسەکە بە کوردی…" required />
          </div>

          {/* Full Content KU */}
          <div style={modal.field}>
            <label style={modal.label}>دەقی تەواوی بابەتەکە</label>
            <RichEditor
              key={(initial?.id || 'new') + '-ku'}
              value={form.contentKu}
              onChangeHTML={(html) => setForm(f => ({ ...f, contentKu: html }))}
              placeholder="دەقی تەواوی بابەتەکە بە کوردی"
              darkMode={darkMode}
            />
          </div>

          {/* ── English Section ── */}
          <div style={{ borderTop: '1px solid rgba(51,170,255,0.1)', paddingTop: '20px', marginTop: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', textAlign: 'left' }}>
              English Content <span style={{ fontWeight: 400, color: '#334155' }}>(optional — shown when language is EN)</span>
            </div>

            {/* EN Title */}
            <div style={{ ...modal.field, marginBottom: '16px' }}>
              <label style={{ ...modal.label, textAlign: 'left' }}>Title (EN)</label>
              <input value={form.titleEn} onChange={set('titleEn')} style={{ ...modal.input, direction: 'ltr', textAlign: 'left' }} placeholder="Activity title in English" />
            </div>

            {/* EN Short Desc */}
            <div style={{ ...modal.field, marginBottom: '16px' }}>
              <label style={{ ...modal.label, textAlign: 'left' }}>Short Description (EN)</label>
              <textarea value={form.shortDescEn} onChange={set('shortDescEn')} style={{ ...modal.input, ...modal.textarea, minHeight: '80px', direction: 'ltr', textAlign: 'left' }} placeholder="Short description in English…" />
            </div>

            {/* EN Full Content */}
            <div style={modal.field}>
              <label style={{ ...modal.label, textAlign: 'left' }}>Full Content (EN)</label>
              <RichEditor
                key={(initial?.id || 'new') + '-en'}
                value={form.contentEn}
                onChangeHTML={(html) => setForm(f => ({ ...f, contentEn: html }))}
                placeholder="Full article content in English"
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* Cover Image */}
          <div style={modal.field}>
            <label style={modal.label}>وێنەی سەرەکی</label>
            <div style={modal.uploadArea} onClick={() => coverRef.current?.click()}>
              {coverPreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={coverPreview} alt="Cover" style={modal.previewImg} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeCover(); }} style={modal.removeBtn}>×</button>
                </div>
              ) : (
                <div style={modal.uploadPlaceholder}>
                  <UploadIcon />
                  <span>کلیک بکە بۆ بارکردنی وێنەی سەرەکی</span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>JPEG، PNG، WebP — زۆرترین ٥ مێگابایت</span>
                </div>
              )}
            </div>
            <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverChange} style={{ display: 'none' }} />
          </div>

          {/* Gallery Images */}
          <div style={modal.field}>
            <label style={modal.label}>وێنەی گەلەری (تا ٥ وێنە)</label>
            <div style={modal.galleryRow}>
              {imgPreviews.map((url, i) => (
                <div key={i} style={modal.galleryThumb}>
                  <img src={url} alt={`Image ${i + 1}`} style={modal.thumbImg} />
                  <button type="button" onClick={() => removeImage(i)} style={modal.removeBtn}>×</button>
                </div>
              ))}
              {imgPreviews.length < 5 && (
                <button type="button" style={modal.addImageBtn} onClick={() => imagesRef.current?.click()}>
                  <PlusIcon /> زیادکردن
                </button>
              )}
            </div>
            <input ref={imagesRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleImagesChange} style={{ display: 'none' }} />
          </div>

          {(uploading) && <div style={modal.info}>وێنەکە باردەکرێت…</div>}
          {uploadError && <div style={modal.errMsg}>{uploadError}</div>}

          {/* YouTube URL */}
          <div style={modal.field}>
            <label style={modal.label}>ڤیدیۆی YouTube (داخۆیی)</label>
            {(() => {
              const url = form.youtubeUrl || '';
              const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
              const ytId = ytMatch?.[1];
              if (ytId) {
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,82,82,0.25)', borderRadius: '9px', padding: '10px 14px' }}>
                    <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{ width: '90px', height: '52px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, color: '#E2E8F0', fontSize: '13px', direction: 'rtl', textAlign: 'right' }}>ڤیدیۆی YouTube زیادکرا</div>
                    <button type="button" onClick={() => setForm(f => ({ ...f, youtubeUrl: '' }))} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>لابردن</button>
                  </div>
                );
              }
              return (
                <input
                  value={url}
                  onChange={set('youtubeUrl')}
                  style={modal.input}
                  placeholder="https://www.youtube.com/watch?v=..."
                  type="url"
                />
              );
            })()}
          </div>

          <div style={modal.actions} className="modal-actions-r">
            <button type="button" onClick={onClose} style={modal.cancelBtn}>پاشگەزبوونەوە</button>
            <button type="submit" style={modal.saveBtn} disabled={saving || uploading}>
              {saving ? 'پاشەکەوتدەکرێت…' : (initial ? 'پاشەکەوتکردن' : 'دروستکردنی چالاکییەکە')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ activity, onConfirm, onClose, deleting }) {
  return (
    <div style={modal.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...modal.box, maxWidth: '440px', padding: '36px' }} className="modal-box-r adm-delete-box">
        <h3 style={{ color: '#F87171', fontSize: '20px', marginTop: 0 }}>سڕینەوەی چالاکییەکە؟</h3>
        <p style={{ color: '#94A3B8', lineHeight: 1.6, marginBottom: '28px' }}>
          دڵنیایت دەتەوێت بسڕیتەوە <strong style={{ color: '#E2E8F0' }} className="adm-delete-name">{activity.titleKu || activity.titleEn}</strong>؟
          ئەم کردارە ناتوانرێت پووچەڵبکرێتەوە.
        </p>
        <div style={modal.actions}>
          <button onClick={onClose} style={modal.cancelBtn}>پاشگەزبوونەوە</button>
          <button onClick={onConfirm} style={{ ...modal.saveBtn, background: 'linear-gradient(135deg, #EF4444, #DC2626)' }} disabled={deleting}>
            {deleting ? 'سڕینەوەدەکرێت…' : 'بەڵێ، بسڕەوە'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboardClient() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [deleteActivity, setDeleteActivity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme');
    if (saved === 'light') setDarkMode(false);
  }, []);

  function toggleAdminTheme() {
    setDarkMode(d => {
      const next = !d;
      localStorage.setItem('admin-theme', next ? 'dark' : 'light');
      return next;
    });
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadActivities() {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch {
      showToast('شکستی هێنا لە باردانی چالاکییەکان', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadActivities(); }, []);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  async function handleSave(form) {
    setSaving(true);
    try {
      const isEdit = !!editActivity;
      const url = isEdit ? `/api/activities/${editActivity.id}` : '/api/activities';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'پاشەکەوتکردن شکستی هێنا');
      }
      await loadActivities();
      setShowForm(false);
      setEditActivity(null);
      showToast(isEdit ? 'چالاکییەکە نوێکرایەوە!' : 'چالاکییەکە دروست کرا!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteActivity) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/activities/${deleteActivity.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('سڕینەوە شکستی هێنا');
      await loadActivities();
      setDeleteActivity(null);
      showToast('چالاکییەکە سڕایەوە');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const filtered = activities.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.titleEn.toLowerCase().includes(q) || a.titleKu.includes(q) || a.date.includes(q);
  });

  function formatDate(d) {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return d; }
  }

  return (
    <div style={dash.page} className="adm-page" data-adm-theme={darkMode ? 'dark' : 'light'}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="adm-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside style={dash.sidebar} className={`adm-sidebar${sidebarOpen ? ' open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">×</button>
        <div style={dash.sidebarLogo}>
          <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '50%' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <div style={{ color: '#E2E8F0', fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }} className="adm-logo-name">Raparin Youth</div>
            <div style={{ color: '#0FC2C0', fontSize: '11px' }} className="adm-logo-sub">پانێلی بەڕێوەبردن</div>
          </div>
        </div>
        <nav style={dash.nav}>
          <div style={dash.navItem}>
            <span style={{ opacity: 0.6 }}>📊</span> داشبۆرد
          </div>
          <a href="/" style={dash.navLink} className="adm-nav-link"><span style={{ opacity: 0.6 }}>🌐</span> بینینی ماڵپەڕ</a>
        </nav>
        <button onClick={handleLogout} style={dash.logoutBtn}>
          <LogoutIcon /> دەرچوون
        </button>
        <button onClick={toggleAdminTheme} style={dash.themeBtn}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
          {darkMode ? ' دۆخی ڕووناک' : ' دۆخی تاریک'}
        </button>
      </aside>

      {/* Main */}
      <main style={dash.main} className="adm-main">
        {/* Top bar */}
        <div style={dash.topbar} className="adm-topbar">
          <div className="adm-topbar-left">
            <button className="adm-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </button>
            <div>
              <h1 style={dash.pageTitle} className="adm-page-title">چالاکییەکان</h1>
              <p style={dash.pageSub} className="adm-page-sub">کۆی چالاکییەکان: {activities.length}</p>
            </div>
          </div>
          <button style={dash.addBtn} onClick={() => { setEditActivity(null); setShowForm(true); }}>
            <PlusIcon /> چالاکیی نوێ
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="گەڕان بەدوای چالاکییەکاندا…"
            style={dash.searchInput}
            className="adm-search"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={dash.loadingMsg}>چالاکییەکان باردەکرێن…</div>
        ) : filtered.length === 0 ? (
          <div style={dash.emptyMsg}>
            {search ? 'هیچ چالاکییەک نەدۆزرایەوە.' : 'هیچ چالاکییەک نییە. یەکەمت دروست بکە!'}
          </div>
        ) : (
          <>
          <div style={dash.tableWrap} className="adm-table-wrap">
            <table style={dash.table}>
              <thead>
                <tr>
                  <th style={dash.th}>وێنەی سەرەکی</th>
                  <th style={dash.th}>ناونیشان</th>
                  <th style={dash.th}>بەروار</th>
                  <th style={dash.th}>وێنەکان</th>
                  <th style={{ ...dash.th, textAlign: 'right' }}>کردەوەکان</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} style={dash.tr}>
                    <td style={dash.td}>
                      {a.coverImage ? (
                        <img src={a.coverImage} alt="" style={dash.thumb} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{ ...dash.thumb, background: `${a.color || '#33AAFF'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          {a.icon || '📌'}
                        </div>
                      )}
                    </td>
                    <td style={dash.td}>
                      <div className="adm-act-title" style={{ fontWeight: 600, fontSize: '14px', marginBottom: '3px' }}>{a.titleEn}</div>
                      {a.titleKu && <div style={{ color: '#64748B', fontSize: '12px', direction: 'rtl', textAlign: 'right' }}>{a.titleKu}</div>}
                      <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.shortDescEn}</div>
                    </td>
                    <td style={dash.td}>
                      <span style={dash.dateBadge}>{formatDate(a.date)}</span>
                    </td>
                    <td style={dash.td}>
                      <span style={dash.imgCount}>{(a.images || []).length} / 5</span>
                    </td>
                    <td style={{ ...dash.td, textAlign: 'right' }}>
                      <div style={dash.actionsCell}>
                        <button style={dash.editBtn} onClick={() => { setEditActivity(a); setShowForm(true); }} title="دەستکاری">
                          <EditIcon /> دەستکاری
                        </button>
                        <button style={dash.deleteBtn} onClick={() => setDeleteActivity(a)} title="سڕینەوە">
                          <DeleteIcon /> سڕینەوە
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="adm-cards">
            {filtered.map((a) => (
              <div key={a.id} className="adm-card">
                <div className="adm-card-header">
                  {a.coverImage ? (
                    <img src={a.coverImage} alt="" className="adm-card-thumb" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="adm-card-thumb adm-card-icon" style={{ background: `${a.color || '#33AAFF'}22` }}>
                      {a.icon || '📌'}
                    </div>
                  )}
                  <div className="adm-card-info">
                    <div className="adm-card-title-en">{a.titleEn}</div>
                    {a.titleKu && <div className="adm-card-title-ku">{a.titleKu}</div>}
                    <span style={dash.dateBadge}>{formatDate(a.date)}</span>
                  </div>
                </div>
                <div className="adm-card-desc" style={{ direction: 'rtl', textAlign: 'right' }}>{a.shortDescKu || a.shortDescEn}</div>
                <div className="adm-card-actions">
                  <button style={dash.editBtn} onClick={() => { setEditActivity(a); setShowForm(true); }}>
                    <EditIcon /> دەستکاری
                  </button>
                  <button style={dash.deleteBtn} onClick={() => setDeleteActivity(a)}>
                    <DeleteIcon /> سڕینەوە
                  </button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <ActivityFormModal
          initial={editActivity}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditActivity(null); }}
          saving={saving}
          darkMode={darkMode}
        />
      )}
      {deleteActivity && (
        <DeleteModal
          activity={deleteActivity}
          onConfirm={handleDelete}
          onClose={() => setDeleteActivity(null)}
          deleting={deleting}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ ...dash.toast, background: toast.type === 'error' ? '#EF4444' : '#0FC2C0' }}>
          {toast.msg}
        </div>
      )}

      {/* Styles are in admin-dashboard.css, imported at the top of this file */}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const dash = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#080F1E',
    fontFamily: "'Inter', sans-serif",
    color: '#E2E8F0',
  },
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#0A1628',
    borderRight: '1px solid rgba(51,170,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(51,170,255,0.08)',
    marginBottom: '16px',
  },
  nav: { flex: 1, padding: '0 12px' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#33AAFF',
    background: 'rgba(51,170,255,0.08)',
    cursor: 'default',
    marginBottom: '4px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#64748B',
    textDecoration: 'none',
    transition: 'background 0.2s, color 0.2s',
    marginBottom: '4px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 12px 6px',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#F87171',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 12px',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid rgba(51,170,255,0.2)',
    color: '#64748B',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  main: {
    flex: 1,
    padding: '32px 40px',
    overflowX: 'auto',
    maxWidth: 'calc(100vw - 240px)',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: 700,
    margin: '0 0 4px',
    color: '#F1F5F9',
  },
  pageSub: {
    color: '#475569',
    fontSize: '14px',
    margin: 0,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #33AAFF 0%, #0FC2C0 100%)',
    border: 'none',
    borderRadius: '10px',
    padding: '11px 20px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(51,170,255,0.3)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  searchInput: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '10px 16px',
    color: '#E2E8F0',
    fontSize: '14px',
    width: '100%',
    maxWidth: '400px',
    transition: 'border-color 0.2s',
  },
  tableWrap: {
    overflowX: 'auto',
    borderRadius: '14px',
    border: '1px solid rgba(51,170,255,0.1)',
    background: '#0A1628',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    padding: '14px 16px',
    textAlign: 'right',
    color: '#475569',
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(51,170,255,0.08)',
    background: 'rgba(51,170,255,0.03)',
  },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' },
  td: { padding: '14px 16px', verticalAlign: 'middle' },
  thumb: {
    width: '52px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover',
    background: '#1E3A5F',
    display: 'block',
  },
  dateBadge: {
    background: 'rgba(51,170,255,0.1)',
    color: '#33AAFF',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  imgCount: {
    color: '#64748B',
    fontSize: '13px',
  },
  actionsCell: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(51,170,255,0.1)',
    border: '1px solid rgba(51,170,255,0.2)',
    borderRadius: '7px',
    padding: '7px 12px',
    color: '#33AAFF',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '7px',
    padding: '7px 12px',
    color: '#F87171',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
  loadingMsg: { color: '#475569', padding: '40px', textAlign: 'center', fontSize: '15px' },
  emptyMsg: {
    color: '#475569',
    padding: '60px',
    textAlign: 'center',
    fontSize: '15px',
    border: '2px dashed rgba(51,170,255,0.1)',
    borderRadius: '14px',
  },
  toast: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    zIndex: 9999,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    animation: 'fadeIn 0.3s ease',
  },
};

const modal = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    overflowY: 'auto',
  },
  box: {
    background: '#0D1F3C',
    border: '1px solid rgba(51,170,255,0.15)',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '860px',
    maxHeight: '92vh',
    overflowY: 'auto',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 28px 20px',
    borderBottom: '1px solid rgba(51,170,255,0.08)',
    position: 'sticky',
    top: 0,
    background: '#0D1F3C',
    zIndex: 2,
    borderRadius: '18px 18px 0 0',
  },
  title: {
    color: '#F1F5F9',
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: 'none',
    borderRadius: '8px',
    padding: '6px',
    color: '#64748B',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.15s',
  },
  form: {
    padding: '24px 28px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cols: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: {
    color: '#94A3B8',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  req: { color: '#0FC2C0' },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '9px',
    padding: '10px 14px',
    color: '#E2E8F0',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
  },
  textarea: {
    resize: 'vertical',
    minHeight: '120px',
    lineHeight: 1.6,
  },
  uploadArea: {
    border: '2px dashed rgba(51,170,255,0.2)',
    borderRadius: '10px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    textAlign: 'center',
    background: 'rgba(51,170,255,0.03)',
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#64748B',
    fontSize: '14px',
  },
  previewImg: {
    maxHeight: '160px',
    maxWidth: '100%',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  galleryRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  galleryThumb: {
    position: 'relative',
    width: '80px',
    height: '70px',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid rgba(51,170,255,0.2)',
  },
  removeBtn: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#EF4444',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    color: '#fff',
    fontSize: '14px',
    lineHeight: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    width: '80px',
    height: '70px',
    border: '2px dashed rgba(51,170,255,0.2)',
    borderRadius: '8px',
    background: 'rgba(51,170,255,0.05)',
    color: '#33AAFF',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '8px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  cancelBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '9px',
    padding: '11px 22px',
    color: '#94A3B8',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #33AAFF 0%, #0FC2C0 100%)',
    border: 'none',
    borderRadius: '9px',
    padding: '11px 24px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(51,170,255,0.3)',
    transition: 'opacity 0.15s',
    fontFamily: 'inherit',
  },
  info: {
    color: '#0FC2C0',
    fontSize: '13px',
    padding: '8px 12px',
    background: 'rgba(15,194,192,0.1)',
    borderRadius: '7px',
  },
  errMsg: {
    color: '#FCA5A5',
    fontSize: '13px',
    padding: '8px 12px',
    background: 'rgba(239,68,68,0.1)',
    borderRadius: '7px',
    border: '1px solid rgba(239,68,68,0.2)',
  },
};