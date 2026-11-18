import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { 
  Image, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('/deposit');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchBanners = async () => {
    try {
      const res = await apiService.adminGetBanners();
      if (res.success) {
        setBanners(res.banners || []);
      }
    } catch (e) {
      console.error('Fetch banners error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!title.trim() || (!imageUrl.trim() && !bannerFile)) {
      alert('Please provide banner title and image');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('linkUrl', linkUrl.trim());
      formData.append('isActive', isActive);
      if (bannerFile) {
        formData.append('bannerImage', bannerFile);
      } else {
        formData.append('imageUrl', imageUrl.trim());
      }

      const res = await apiService.adminAddBanner(formData);
      if (res.success) {
        showNotification('Banner created and published!');
        setShowAddModal(false);
        setTitle('');
        setImageUrl('');
        setBannerFile(null);
        await fetchBanners();
      } else {
        alert(res.message || 'Failed to create banner');
      }
    } catch (err) {
      alert('Network error adding banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBanner = async (banner) => {
    try {
      const res = await apiService.adminUpdateBanner(banner.id, { isActive: !banner.isActive });
      if (res.success) {
        showNotification(`Banner ${!banner.isActive ? 'Activated' : 'Deactivated'}`);
        await fetchBanners();
      }
    } catch {
      alert('Error toggling banner');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await apiService.adminDeleteBanner(id);
      if (res.success) {
        showNotification('Banner deleted');
        await fetchBanners();
      }
    } catch {
      alert('Error deleting banner');
    }
  };

  return (
    <div className="space-y-6">

        {/* Toast */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* Header Action */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div>
            <h2 className="text-base font-black text-white">Announcement Popups</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage promotional and alert popup modals displayed to users upon logging in.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add New Banner
          </button>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-8 text-center text-slate-500 animate-pulse">
              Loading banners...
            </div>
          ) : banners.length === 0 ? (
            <div className="col-span-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500">
              No banners uploaded yet.
            </div>
          ) : (
            banners.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        b.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {b.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-sm text-white truncate">{b.title}</h3>
                    <p className="text-xs text-slate-400 font-mono truncate">{b.linkUrl}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-800/60 mt-2 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleBanner(b)}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300"
                  >
                    {b.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
            <h3 className="font-black text-base">Create Home Announcement Banner</h3>
            <p className="text-xs text-slate-400 mt-1">
              This popup modal will display to all users on the Home dashboard.
            </p>

            <form onSubmit={handleAddBanner} className="space-y-4 mt-5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Banner Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Festive Deposit Bonus +5%"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Upload Image File OR Enter Image URL
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-purple-600 file:text-white mb-2"
                />
                <input
                  type="url"
                  placeholder="Or enter direct image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  CTA Link Destination (Optional)
                </label>
                <input
                  type="text"
                  placeholder="/deposit or external https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0"
                />
                <label htmlFor="activeToggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Publish and activate immediately
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-black text-xs text-white transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

