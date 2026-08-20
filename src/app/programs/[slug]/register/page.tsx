'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { 
  getProgrammes, 
  getCategories, 
  getTeams, 
  getProgrammeRegistrations,
  submitPublicRegistration,
  Programme, 
  Category, 
  Team,
  ProgrammeRegistration
} from '@/lib/cmsService';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  UserCheck, 
  Users, 
  Share2, 
  Copy, 
  Printer, 
  ArrowLeft, 
  Sparkles,
  Lock,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProgrammeRegisterPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const slug = resolvedParams.slug;

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [programmeCategories, setProgrammeCategories] = useState<Category[]>([]);
  const [registeredCount, setRegisteredCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [participantType, setParticipantType] = useState<'student' | 'team'>('student');
  const [fullName, setFullName] = useState<string>('');
  const [studentIdCode, setStudentIdCode] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [classGrade, setClassGrade] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<{ name: string; class_grade?: string }[]>([
    { name: '', class_grade: '' }
  ]);

  // Status & Confirmation
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ProgrammeRegistration | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    setIsLoading(true);
    const [allPrg, allCat, allTeams] = await Promise.all([
      getProgrammes(false, true),
      getCategories(),
      getTeams(),
    ]);

    const targetPrg = allPrg.find(p => p.slug === slug || p.id === slug);
    if (targetPrg) {
      setProgramme(targetPrg);

      // Filter applicable categories for this programme
      let applicableCat: Category[] = [];
      if (targetPrg.category_ids && targetPrg.category_ids.length > 0) {
        applicableCat = allCat.filter(c => targetPrg.category_ids?.includes(c.id));
      } else if (targetPrg.category_id) {
        applicableCat = allCat.filter(c => c.id === targetPrg.category_id);
      } else {
        applicableCat = allCat;
      }
      setProgrammeCategories(applicableCat);
      if (applicableCat.length > 0) {
        setCategoryId(applicableCat[0].id);
      }

      // Load registered count for seat capacity check
      const regs = await getProgrammeRegistrations(targetPrg.id);
      const valid = regs.filter(r => r.status !== 'Rejected' && r.status !== 'Cancelled');
      setRegisteredCount(valid.length);

      if (targetPrg.competition_type === 'Team') {
        setParticipantType('team');
      }
    }

    setCategories(allCat);
    setTeams(allTeams);
    setIsLoading(false);
  };

  // Gender Eligibility Validation Effect
  useEffect(() => {
    if (!categoryId) {
      setGenderError(null);
      return;
    }
    const cat = categories.find(c => c.id === categoryId);
    if (cat) {
      const catName = cat.name_en.toLowerCase();
      if (catName.includes('female') && gender === 'Male') {
        setGenderError('This participant is not eligible for this category.');
      } else if (catName.includes('male') && !catName.includes('female') && gender === 'Female') {
        setGenderError('This participant is not eligible for this category.');
      } else {
        setGenderError(null);
      }
    }
  }, [categoryId, gender, categories]);

  const handleAddTeamMember = () => {
    const maxTeam = programme?.max_team_size || 10;
    if (teamMembers.length + 1 >= maxTeam) {
      alert(`Maximum team size for this event is ${maxTeam} members.`);
      return;
    }
    setTeamMembers(prev => [...prev, { name: '', class_grade: '' }]);
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTeamMember = (index: number, field: 'name' | 'class_grade', value: string) => {
    setTeamMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyRegId = () => {
    if (confirmation?.registration_id_code) {
      navigator.clipboard.writeText(confirmation.registration_id_code);
      showToast('Registration ID copied.');
    }
  };

  const handleShareConfirmation = () => {
    if (!confirmation) return;
    const shareUrl = `${window.location.origin}/programs/registration-status?code=${confirmation.registration_id_code}`;
    if (navigator.share) {
      navigator.share({
        title: `Registration Confirmation — ${programme?.title_en}`,
        text: `Registration ID: ${confirmation.registration_id_code} for ${confirmation.full_name}`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('Link copied to clipboard.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programme) return;

    if (genderError) {
      setErrorMessage(genderError);
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter full name.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Please select a category.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const reg = await submitPublicRegistration({
        programme_id: programme.id,
        participant_type: participantType,
        full_name: fullName.trim(),
        student_id_code: studentIdCode.trim() || undefined,
        category_id: categoryId,
        gender,
        class_grade: classGrade.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        contact_email: contactEmail.trim() || undefined,
        team_id: teamId || undefined,
        team_name: teamName.trim() || undefined,
        team_members: participantType === 'team' ? teamMembers.filter(m => m.name.trim() !== '') : undefined,
      });

      setConfirmation(reg);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
        <HeaderNav />
        <div className="text-center py-32 text-amber-400 flex items-center justify-center gap-2 font-bold text-sm">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading registration form...</span>
        </div>
        <FooterSection />
      </div>
    );
  }

  if (!programme) {
    return (
      <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
        <HeaderNav />
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h1 className="text-2xl font-black text-emerald-100">Programme Not Found</h1>
          <p className="text-xs text-emerald-300">The requested programme registration form does not exist or has been removed.</p>
          <Link href="/programs" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-emerald-950 text-xs font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Programmes Roster</span>
          </Link>
        </div>
        <FooterSection />
      </div>
    );
  }

  // 1. Check Registration Mode (Admin Only Guard)
  const isModeAdminOnly = (programme.registration_mode === 'Admin Only');

  // 2. Check Deadline & Open Status & Seat Capacity
  const isClosedStatus = programme.registration_open === false;
  const isPastDeadline = programme.registration_deadline && (new Date(programme.registration_deadline).getTime() < Date.now()) && !programme.allow_late_registration;
  const isCapacityFull = programme.max_participants ? registeredCount >= programme.max_participants : false;
  const isRegistrationClosed = isClosedStatus || isPastDeadline || isCapacityFull;

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-5 z-50 bg-amber-500 text-emerald-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-fade-in border border-amber-300">
            {toastMessage}
          </div>
        )}

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          {/* Back Navigation Button */}
          <Link 
            href="/programs" 
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Programmes</span>
          </Link>

          {/* Programme Header Card */}
          <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                {programme.code || 'PRG'}
              </span>

              <span className="px-3 py-1 rounded-full bg-emerald-900 border border-emerald-700 text-emerald-200 text-[10px] font-extrabold">
                {programme.competition_type} Competition
              </span>

              {programme.max_participants && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                  isCapacityFull ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {registeredCount} / {programme.max_participants} Seats Available
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-gold-gradient tracking-tight">
              {programme.title_en}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
              {programme.description_en}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-emerald-300/90 border-t border-emerald-800/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>{programme.event_date || 'Schedule Announced'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{programme.start_time} - {programme.end_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{programme.venue || 'Main Stage'}</span>
              </div>
            </div>
          </div>

          {/* 1. REGISTRATION DISABLED PAGE (Admin Only) */}
          {isModeAdminOnly ? (
            <div className="bg-emerald-950/90 border border-amber-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
              <Lock className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-xl font-extrabold text-emerald-100">Online registration is not available for this programme.</h2>
              <p className="text-xs text-emerald-300 max-w-md mx-auto">
                Registrations for this competition are managed exclusively by event administrators at the main desk.
              </p>
              <Link 
                href="/programs" 
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black transition-all shadow-lg"
              >
                <span>View Other Programmes</span>
              </Link>
            </div>
          ) : isRegistrationClosed ? (
            /* 2. REGISTRATION CLOSED PAGE */
            <div className="bg-emerald-950/90 border border-red-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
              <XCircle className="w-12 h-12 text-red-400 mx-auto" />
              <h2 className="text-2xl font-black text-red-300">Registration Closed</h2>
              <p className="text-xs text-emerald-300 max-w-md mx-auto">
                {isCapacityFull ? (
                  'Seat capacity limit has been reached for this competition.'
                ) : isPastDeadline ? (
                  `Registration deadline ended on ${new Date(programme.registration_deadline!).toLocaleDateString()}.`
                ) : (
                  'Registration is currently closed by event managers.'
                )}
              </p>
              <Link 
                href="/programs" 
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold transition-all border border-emerald-700"
              >
                <span>Explore Open Programmes</span>
              </Link>
            </div>
          ) : confirmation ? (
            /* 3. REGISTRATION CONFIRMATION CARD */
            <div className="bg-emerald-950/90 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
                  {confirmation.status === 'Confirmed' ? 'Official Confirmation' : 'Submission Received'}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-emerald-100">
                  {confirmation.status === 'Confirmed' ? 'Registration Successful!' : 'Pending Admin Review'}
                </h2>

                <p className="text-xs text-emerald-300/80">
                  {confirmation.status === 'Confirmed' 
                    ? 'Your entry has been confirmed and added to the official event roster.' 
                    : 'Your registration has been submitted and is currently pending verification by administrators.'}
                </p>
              </div>

              {/* Secure Registration ID Display */}
              <div className="bg-emerald-900/60 border border-amber-500/40 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] text-amber-300 uppercase font-black tracking-widest block">Unique Registration ID</span>
                <span className="text-3xl sm:text-4xl font-mono font-black text-gold-gradient tracking-widest block">
                  {confirmation.registration_id_code}
                </span>
                <p className="text-[11px] text-emerald-400">Save this ID to check your status or present at the event desk.</p>
              </div>

              {/* Detail Summary Roster */}
              <div className="bg-emerald-900/30 border border-emerald-800 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-800/40">
                  <span className="text-emerald-400 font-semibold">Participant Name:</span>
                  <span className="font-extrabold text-emerald-100">{confirmation.full_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-800/40">
                  <span className="text-emerald-400 font-semibold">Programme:</span>
                  <span className="font-extrabold text-emerald-100">{programme.title_en}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-800/40">
                  <span className="text-emerald-400 font-semibold">Category:</span>
                  <span className="font-extrabold text-amber-300">{confirmation.category_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-800/40">
                  <span className="text-emerald-400 font-semibold">Gender:</span>
                  <span className="font-extrabold text-emerald-100">{confirmation.gender}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-emerald-400 font-semibold">Status:</span>
                  <span className={`font-extrabold ${confirmation.status === 'Confirmed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {confirmation.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleCopyRegId}
                  className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Registration ID</span>
                </button>

                <button
                  onClick={handleShareConfirmation}
                  className="py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold transition-all border border-emerald-700 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Confirmation</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="py-3 px-4 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-bold transition-all border border-emerald-800 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Confirmation</span>
                </button>
              </div>
            </div>
          ) : (
            /* 4. PUBLIC REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="border-b border-emerald-800/60 pb-4">
                <h2 className="text-lg font-black text-emerald-100 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <span>Participant Registration Form</span>
                </h2>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Complete required participant fields. Automatic gender eligibility and duplicate checks will be performed.
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Participant Type Selector (If Both allowed) */}
              {programme.competition_type === 'Individual+Team' && (
                <div className="flex items-center gap-4 bg-emerald-900/40 p-2 rounded-2xl border border-emerald-800 max-w-md">
                  <button
                    type="button"
                    onClick={() => setParticipantType('student')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      participantType === 'student' ? 'bg-amber-500 text-emerald-950 shadow-md' : 'text-emerald-300'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Individual Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setParticipantType('team')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      participantType === 'team' ? 'bg-amber-500 text-emerald-950 shadow-md' : 'text-emerald-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Team Roster</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-extrabold text-amber-300">
                    {participantType === 'student' ? 'Participant Full Name *' : 'Team Leader / Representative Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full legal name..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Category Selection (Filtered strictly to programme's configured categories) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-extrabold text-amber-300">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  >
                    {programmeCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name_en} {c.age_range ? `(${c.age_range})` : ''} {c.class_range ? `[${c.class_range}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender Eligibility Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-amber-300">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

                  {genderError && (
                    <p className="text-[11px] text-red-400 font-bold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{genderError}</span>
                    </p>
                  )}
                </div>

                {/* Student ID / Code */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-amber-300">Student ID / Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. STU-0012"
                    value={studentIdCode}
                    onChange={(e) => setStudentIdCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Class / Grade */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-amber-300">Class / Grade (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 10"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-amber-300">Contact Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Existing Team Selection (If available) */}
                {teams.length > 0 && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-extrabold text-amber-300">Select Team / House (Optional)</label>
                    <select
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="">-- No Team (Independent) --</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.code} - {t.name_en}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Team Specific Registration Fields */}
                {participantType === 'team' && (
                  <div className="sm:col-span-2 space-y-4 pt-4 border-t border-emerald-800/60">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-amber-300">Team Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter team name..."
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-amber-300">
                          Team Members Roster ({teamMembers.length + 1} members)
                        </label>

                        <button
                          type="button"
                          onClick={handleAddTeamMember}
                          className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Member</span>
                        </button>
                      </div>

                      {teamMembers.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder={`Member #${idx + 2} Full Name`}
                            value={m.name}
                            onChange={(e) => handleUpdateTeamMember(idx, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Class"
                            value={m.class_grade || ''}
                            onChange={(e) => handleUpdateTeamMember(idx, 'class_grade', e.target.value)}
                            className="w-24 px-3 py-2 rounded-xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs"
                          />
                          {teamMembers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamMember(idx)}
                              className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!genderError}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Registration...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Programme Registration</span>
                  </>
                )}
              </button>
            </form>
          )}
        </main>
      </div>

      <FooterSection />
    </div>
  );
}
