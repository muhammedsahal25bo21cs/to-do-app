'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  updateSiteSettings, 
  createCategory, 
  createProgramme,
  createAdminProfile,
  getCategories, 
  getSiteSettings,
  SiteSettings 
} from '@/lib/cmsService';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Palette, 
  FolderTree, 
  Save, 
  Trophy, 
  UserCheck, 
  Globe, 
  UserPlus, 
  HelpCircle,
  Eye
} from 'lucide-react';

export default function AdminSetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Event Info
  const [eventName, setEventName] = useState('Milad Fest 2K26');
  const [subtitle, setSubtitle] = useState('Annual Cultural & Academic Competitions');
  const [organizer, setOrganizer] = useState('Raulathul Madheena Committee');
  const [description, setDescription] = useState('Welcome to the official event portal. Explore schedules, published results, and leaderboards.');
  const [startDate, setStartDate] = useState('2026-08-29');
  const [endDate, setEndDate] = useState('2026-08-30');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [venueName, setVenueName] = useState('Main Auditorium');

  // Step 2: Branding
  const [logoUrl, setLogoUrl] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [posterFooterText, setPosterFooterText] = useState('Official Event Committee');
  const [primaryColor, setPrimaryColor] = useState('#064e3b');
  const [secondaryColor, setSecondaryColor] = useState('#f59e0b');

  // Step 3: Categories
  const [newCatName, setNewCatName] = useState('');
  const [newCatLevel, setNewCatLevel] = useState<'Sub-Junior' | 'Junior' | 'Senior' | 'General'>('Junior');
  const [addedCategories, setAddedCategories] = useState<{ name: string; level: string }[]>([
    { name: 'Sub-Junior', level: 'Sub-Junior' },
    { name: 'Junior', level: 'Junior' },
    { name: 'Senior', level: 'Senior' }
  ]);

  // Step 4: Initial Programme
  const [prgTitle, setPrgTitle] = useState('Qira\'at Competition');
  const [prgCategory, setPrgCategory] = useState('Junior');
  const [prgType, setPrgType] = useState<'individual' | 'team'>('individual');
  const [prgVenue, setPrgVenue] = useState('Main Stage');
  const [prgMaxScore, setPrgMaxScore] = useState(100);

  // Step 5: Leaderboard Points
  const [firstPoints, setFirstPoints] = useState(10);
  const [secondPoints, setSecondPoints] = useState(7);
  const [thirdPoints, setThirdPoints] = useState(5);

  // Step 6: Registration Rules
  const [regMode, setRegMode] = useState<'Both' | 'Admin Only' | 'Public'>('Both');
  const [approvalMode, setApprovalMode] = useState<'Automatic' | 'Manual'>('Automatic');
  const [capacity, setCapacity] = useState(50);
  const [regDeadline, setRegDeadline] = useState('2026-08-28');

  // Step 7: Public Website Visibility
  const [showResults, setShowResults] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showAnnouncements, setShowAnnouncements] = useState(true);

  // Step 8: Admin & Staff Accounts
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'Super Admin' | 'Event Manager' | 'Score Manager' | 'Result Manager' | 'Check-in Staff'>('Check-in Staff');
  const [addedStaff, setAddedStaff] = useState<{ name: string; email: string; role: string }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getSiteSettings().then(s => {
      if (s) {
        if (s.event_name_en) setEventName(s.event_name_en);
        if (s.event_subtitle_en) setSubtitle(s.event_subtitle_en);
        if (s.organizer_name_en) setOrganizer(s.organizer_name_en);
        if (s.venue_en) setVenueName(s.venue_en);
      }
    });
  }, []);

  const handleAddCategory = () => {
    if (newCatName.trim() && !addedCategories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      setAddedCategories([...addedCategories, { name: newCatName.trim(), level: newCatLevel }]);
      setNewCatName('');
    }
  };

  const handleAddStaff = () => {
    if (staffName.trim() && staffEmail.trim()) {
      setAddedStaff([...addedStaff, { name: staffName.trim(), email: staffEmail.trim(), role: staffRole }]);
      setStaffName('');
      setStaffEmail('');
    }
  };

  const handlePublishEvent = async () => {
    if (!eventName.trim() || !startDate) {
      alert('Please complete the required Event Name and Start Date fields.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update Site Settings
      await updateSiteSettings({
        event_name_en: eventName,
        event_subtitle_en: subtitle,
        organizer_name_en: organizer,
        description_en: description,
        event_date: startDate,
        event_end_date: endDate,
        event_time: `${startTime} onwards`,
        venue_en: venueName,
        logo_url: logoUrl || undefined,
        hero_image_url: heroImage || undefined,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        event_status: 'Upcoming',
        public_pages_visibility: {
          home: true,
          programs: true,
          results: showResults,
          leaderboard: showLeaderboard,
          announcements: showAnnouncements,
          gallery: true,
          venue: true,
          verify: true,
        }
      });

      // 2. Create Categories
      const existingCats = await getCategories();
      for (let i = 0; i < addedCategories.length; i++) {
        const item = addedCategories[i];
        const match = existingCats.find(c => c.name_en.toLowerCase() === item.name.toLowerCase());
        if (!match) {
          await createCategory({
            name_en: item.name,
            short_name: item.level,
            display_order: i + 1,
            is_enabled: true,
          });
        }
      }

      // 3. Create Sample Initial Programme if defined
      if (prgTitle.trim()) {
        const freshCats = await getCategories();
        const catMatch = freshCats.find(c => c.name_en.toLowerCase() === prgCategory.toLowerCase()) || freshCats[0];
        await createProgramme({
          title_en: prgTitle,
          description_en: '',
          category_id: catMatch?.id || undefined,
          competition_type: prgType === 'individual' ? 'Individual' : 'Team',
          venue: prgVenue,
          event_date: startDate,
          start_time: '09:00',
          end_time: '10:00',
          max_score: prgMaxScore,
          status: 'draft',
          is_published: false,
          display_order: 1,
          registration_mode: regMode,
          approval_mode: approvalMode,
          max_participants: capacity,
          registration_deadline: regDeadline,
        });
      }

      // 4. Create Staff Profiles
      for (const st of addedStaff) {
        await createAdminProfile({
          email: st.email,
          name_en: st.name,
          role: st.role as any,
          status: 'Active',
        });
      }

      router.push('/admin');
    } catch (e: any) {
      alert('Error publishing event settings: ' + (e.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round((step / 8) * 100);

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Wizard Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Real Event Initialization Wizard (Step {step} of 8)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
            Configure Live Event & Setup Platform
          </h1>
          <p className="text-xs text-emerald-300/80 max-w-xl mx-auto">
            Input authoritative event information, branding, categories, initial programmes, leaderboard rules, and staff accounts.
          </p>
        </div>

        {/* Progress Tracker Bar */}
        <div className="bg-emerald-900/50 p-4 rounded-3xl border border-emerald-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-emerald-200">
            <span>Setup Completion Progress</span>
            <span className="text-amber-400 font-mono font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-3 rounded-full bg-emerald-950 overflow-hidden border border-emerald-800">
            <div 
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 overflow-x-auto gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 transition-all ${
                  step === i ? 'bg-amber-500 text-emerald-950 shadow-md' :
                  step > i ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-950 text-emerald-500 border border-emerald-800'
                }`}
              >
                {i}. {
                  i === 1 ? 'Event Info' :
                  i === 2 ? 'Branding' :
                  i === 3 ? 'Categories' :
                  i === 4 ? 'Programmes' :
                  i === 5 ? 'Leaderboard' :
                  i === 6 ? 'Registration' :
                  i === 7 ? 'Public Pages' : 'Staff Users'
                }
              </button>
            ))}
          </div>
        </div>

        {/* Step Card Body */}
        <div className="bg-emerald-950/90 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* STEP 1: Event Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Step 1: Event Information
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-800">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Configure core event identity and schedule dates</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Organizer Name</label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={e => setOrganizer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Main Venue Name</label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={e => setVenueName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">Short Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Branding */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <Palette className="w-5 h-5" /> Step 2: Visual Branding & Assets
                </h2>
                <span className="text-[11px] text-emerald-400 font-bold">Logo, Colors & Poster Branding</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Event Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Hero Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={heroImage}
                    onChange={e => setHeroImage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">Result Poster & Certificate Branding Text</label>
                <input
                  type="text"
                  value={posterFooterText}
                  onChange={e => setPosterFooterText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-emerald-900 border border-emerald-700 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Secondary Color</label>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-emerald-900 border border-emerald-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Categories */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <FolderTree className="w-5 h-5" /> Step 3: Dynamic Category Configuration
                </h2>
                <span className="text-[11px] text-amber-300 font-bold">Guidance: Create categories before adding programmes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Sub-Junior, Junior, Senior)"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shrink-0"
                >
                  Add Category
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {addedCategories.map((c, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-700 text-amber-300 font-extrabold text-xs">
                    <span>{c.name} ({c.level})</span>
                    <button onClick={() => setAddedCategories(addedCategories.filter((_, i) => i !== idx))} className="text-red-400 font-bold hover:text-white">✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Programmes Setup */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Step 4: Festival Programmes Roster
                </h2>
                <span className="text-[11px] text-emerald-400 font-bold">Configure Initial Programme</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Programme Title</label>
                  <input
                    type="text"
                    value={prgTitle}
                    onChange={e => setPrgTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Category</label>
                  <select
                    value={prgCategory}
                    onChange={e => setPrgCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  >
                    {addedCategories.map((c, i) => (
                      <option key={i} value={c.name} className="bg-emerald-950">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Type</label>
                  <select
                    value={prgType}
                    onChange={e => setPrgType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="individual" className="bg-emerald-950">Individual</option>
                    <option value="team" className="bg-emerald-950">Team</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Venue Stage</label>
                  <input
                    type="text"
                    value={prgVenue}
                    onChange={e => setPrgVenue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Max Score</label>
                  <input
                    type="number"
                    value={prgMaxScore}
                    onChange={e => setPrgMaxScore(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Leaderboard Rules */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> Step 5: Leaderboard Point Allocation
                </h2>
                <span className="text-[11px] text-amber-300 font-bold">Guidance: Leaderboard points can be edited later</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-center space-y-1">
                  <label className="block text-xs font-black text-amber-300">1st Place Points</label>
                  <input
                    type="number"
                    value={firstPoints}
                    onChange={e => setFirstPoints(Number(e.target.value))}
                    className="w-full text-center px-3 py-2 rounded-xl bg-emerald-900 border border-amber-500/50 text-amber-300 font-black text-lg focus:outline-none"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-slate-300/10 border border-slate-300/40 text-center space-y-1">
                  <label className="block text-xs font-black text-slate-200">2nd Place Points</label>
                  <input
                    type="number"
                    value={secondPoints}
                    onChange={e => setSecondPoints(Number(e.target.value))}
                    className="w-full text-center px-3 py-2 rounded-xl bg-emerald-900 border border-slate-300/50 text-slate-200 font-black text-lg focus:outline-none"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-amber-700/10 border border-amber-700/40 text-center space-y-1">
                  <label className="block text-xs font-black text-amber-400">3rd Place Points</label>
                  <input
                    type="number"
                    value={thirdPoints}
                    onChange={e => setThirdPoints(Number(e.target.value))}
                    className="w-full text-center px-3 py-2 rounded-xl bg-emerald-900 border border-amber-700/50 text-amber-400 font-black text-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Registration Rules */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" /> Step 6: Registration & Capacity Rules
                </h2>
                <span className="text-[11px] text-emerald-400 font-bold">Public & Admin Registration Modes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Registration Mode</label>
                  <select
                    value={regMode}
                    onChange={e => setRegMode(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="both" className="bg-emerald-950">Public & Admin Registration</option>
                    <option value="public_only" className="bg-emerald-950">Public Registration Only</option>
                    <option value="admin_only" className="bg-emerald-950">Admin Registration Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Approval Workflow</label>
                  <select
                    value={approvalMode}
                    onChange={e => setApprovalMode(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Automatic" className="bg-emerald-950">Automatic Approval</option>
                    <option value="Manual" className="bg-emerald-950">Manual Admin Review Required</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Max Participant Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Registration Deadline</label>
                  <input
                    type="date"
                    value={regDeadline}
                    onChange={e => setRegDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Public Website Visibility */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <Globe className="w-5 h-5" /> Step 7: Public Website Visibility Settings
                </h2>
                <span className="text-[11px] text-amber-300 font-bold">Guidance: Published results will be publicly visible</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 cursor-pointer">
                  <span className="text-xs font-bold text-emerald-100">Public Results Page (`/results`)</span>
                  <input
                    type="checkbox"
                    checked={showResults}
                    onChange={e => setShowResults(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 cursor-pointer">
                  <span className="text-xs font-bold text-emerald-100">Public Leaderboard Page (`/leaderboard`)</span>
                  <input
                    type="checkbox"
                    checked={showLeaderboard}
                    onChange={e => setShowLeaderboard(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 cursor-pointer">
                  <span className="text-xs font-bold text-emerald-100">Public Announcements Feed (`/announcements`)</span>
                  <input
                    type="checkbox"
                    checked={showAnnouncements}
                    onChange={e => setShowAnnouncements(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 8: Admin Users & Staff Accounts */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Step 8: Admin Users & Role Accounts
                </h2>
                <span className="text-[11px] text-emerald-400 font-bold">Add Staff Accounts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Staff Name"
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={staffEmail}
                  onChange={e => setStaffEmail(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                />
                <select
                  value={staffRole}
                  onChange={e => setStaffRole(e.target.value as any)}
                  className="px-4 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                >
                  <option value="Check-in Staff" className="bg-emerald-950">Check-in Staff</option>
                  <option value="Score Manager" className="bg-emerald-950">Score Manager / Judge</option>
                  <option value="Event Manager" className="bg-emerald-950">Event Manager</option>
                  <option value="Result Manager" className="bg-emerald-950">Result Manager</option>
                  <option value="Super Admin" className="bg-emerald-950">Super Admin</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddStaff}
                className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 font-bold text-xs"
              >
                Add Staff Account
              </button>

              <div className="space-y-2 pt-2">
                {addedStaff.map((st, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-emerald-100">{st.name}</span> ({st.email})
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-extrabold uppercase">
                      {st.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t border-emerald-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-300 font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                Skip Wizard
              </button>
            )}

            {step < 8 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublishEvent}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-xl transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing Event...' : 'Publish Live Event'}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
