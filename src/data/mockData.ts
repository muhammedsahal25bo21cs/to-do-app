export interface Program {
  id: string;
  code: string;
  nameMl: string;
  nameEn: string;
  category: 'Sub-Junior' | 'Junior' | 'Senior' | 'General';
  type: 'Individual' | 'Group';
  venue: string;
  venueCode: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Live' | 'Completed';
  participantsCount?: number;
  duration?: string;
}

export interface ScheduleItem {
  id: string;
  day: 'Day 1' | 'Day 2';
  hijriDate: string;
  gregorianDate: string;
  timeSlot: string;
  programCode: string;
  programNameMl: string;
  programNameEn: string;
  category: string;
  venue: string;
  status: 'Completed' | 'Live' | 'Upcoming';
  session: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
}

export interface ResultParticipant {
  position: 1 | 2 | 3;
  nameMl: string;
  nameEn: string;
  teamId: string;
  teamNameMl: string;
  teamColor: string;
  chestNo: string;
  grade: 'A' | 'B' | 'C' | 'Pass';
  points: number;
}

export interface ProgramResult {
  id: string;
  programCode: string;
  programNameMl: string;
  programNameEn: string;
  category: 'Sub-Junior' | 'Junior' | 'Senior' | 'General';
  type: 'Individual' | 'Group';
  venue: string;
  date: string;
  winners: ResultParticipant[];
}

export interface TeamLeaderboard {
  rank: number;
  id: string;
  nameMl: string;
  nameEn: string;
  chestPrefix: string;
  color: string;
  bgGradient: string;
  badgeBg: string;
  textColor: string;
  totalPoints: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  aGrades: number;
  bGrades: number;
  captainMl: string;
}

export interface GalleryItem {
  id: string;
  titleMl: string;
  titleEn: string;
  category: 'Inauguration' | 'Competitions' | 'Duffmutt' | 'Majlis' | 'Prizes';
  categoryMl: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  date: string;
  captionMl: string;
}

export const FESTIVAL_INFO = {
  titleMl: 'നബിദിന മീലാദ് ഷരീഫ് 1446',
  titleEn: 'Nabidinam Milad Fest 1446',
  subTitleMl: 'ചിറക്കൽ തൻവീറുൽ ഇസ്‌ലാം സംഗീത സാഹിത്യ കലാസമ്മേളനം',
  subTitleEn: 'Chirakkal Islamic Cultural & Arts Festival',
  year: '1446 / 2026',
  startDate: '2026-09-15',
  endDate: '2026-09-16',
  hijriDates: '12-13 റബീഉൽ അവ്വൽ 1446',
  locationMl: 'ഇമാം ഗസ്സാലി നഗർ (സെൻട്രൽ മൈതാനി, ചിറക്കൽ)',
  locationEn: 'Imam Gazzali Nagar, Chirakkal',
  contactPhone: '+91 98765 43210',
  contactEmail: 'info@nabidinamfest.org',
  totalTeams: 4,
  totalPrograms: 42,
  totalParticipants: 280,
  totalVenues: 3,
};

export const TEAMS: TeamLeaderboard[] = [
  {
    rank: 1,
    id: 'farqan',
    nameMl: 'ഫർഖാന്മാർ',
    nameEn: 'Team Farqan',
    chestPrefix: 'FRQ',
    color: '#059669',
    bgGradient: 'from-emerald-900/40 via-emerald-800/20 to-emerald-950/60',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    textColor: 'text-emerald-400',
    totalPoints: 345,
    goldCount: 14,
    silverCount: 9,
    bronzeCount: 6,
    aGrades: 28,
    bGrades: 12,
    captainMl: 'മുഹമ്മദ് യാസീൻ',
  },
  {
    rank: 2,
    id: 'rayyan',
    nameMl: 'റയ്യാന്മാർ',
    nameEn: 'Team Rayyan',
    chestPrefix: 'RYN',
    color: '#2563eb',
    bgGradient: 'from-blue-900/40 via-blue-800/20 to-blue-950/60',
    badgeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    textColor: 'text-blue-400',
    totalPoints: 312,
    goldCount: 11,
    silverCount: 12,
    bronzeCount: 8,
    aGrades: 25,
    bGrades: 15,
    captainMl: 'അബ്ദുല്ല ഫാസിൽ',
  },
  {
    rank: 3,
    id: 'salsabeel',
    nameMl: 'സൽസബീൽ',
    nameEn: 'Team Salsabeel',
    chestPrefix: 'SLS',
    color: '#d97706',
    bgGradient: 'from-amber-900/40 via-amber-800/20 to-amber-950/60',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    textColor: 'text-amber-400',
    totalPoints: 288,
    goldCount: 9,
    silverCount: 10,
    bronzeCount: 11,
    aGrades: 22,
    bGrades: 18,
    captainMl: 'മുഹമ്മദ് റബീഹ്',
  },
  {
    rank: 4,
    id: 'sufiyan',
    nameMl: 'സൂഫിയാൻ',
    nameEn: 'Team Sufiyan',
    chestPrefix: 'SFN',
    color: '#7c3aed',
    bgGradient: 'from-purple-900/40 via-purple-800/20 to-purple-950/60',
    badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    textColor: 'text-purple-400',
    totalPoints: 264,
    goldCount: 8,
    silverCount: 8,
    bronzeCount: 10,
    aGrades: 20,
    bGrades: 16,
    captainMl: 'അഹ്മദ് റയാൻ',
  },
];

export const VENUES = [
  { code: 'V1', nameMl: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ', nameEn: 'Stage 1: Imam Gazzali Nagar', main: true },
  { code: 'V2', nameMl: 'വേദി 2: മദീന നഗർ', nameEn: 'Stage 2: Madina Nagar', main: false },
  { code: 'V3', nameMl: 'വേദി 3: ഹറം ഹാൾ', nameEn: 'Stage 3: Haram Hall', main: false },
];

export const PROGRAMS: Program[] = [
  {
    id: 'p1',
    code: 'P101',
    nameMl: 'ഖുർആൻ പാരായണം',
    nameEn: 'Quran Tilawat',
    category: 'Sub-Junior',
    type: 'Individual',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    venueCode: 'V1',
    date: '12 റബീഉൽ അവ്വൽ',
    time: '09:00 AM',
    status: 'Completed',
    participantsCount: 12,
    duration: '45 mins',
  },
  {
    id: 'p2',
    code: 'P102',
    nameMl: 'ഹിഫ്ള് പാരായണം',
    nameEn: 'Hifdh Recitation',
    category: 'Junior',
    type: 'Individual',
    venue: 'വേദി 3: ഹറം ഹാൾ',
    venueCode: 'V3',
    date: '12 റബീഉൽ അവ്വൽ',
    time: '10:00 AM',
    status: 'Completed',
    participantsCount: 10,
    duration: '60 mins',
  },
  {
    id: 'p3',
    code: 'P103',
    nameMl: 'അറബിക് ഗാനം',
    nameEn: 'Arabic Song',
    category: 'Junior',
    type: 'Individual',
    venue: 'വേദി 2: മദീന നഗർ',
    venueCode: 'V2',
    date: '12 റബീഉൽ അവ്വൽ',
    time: '11:15 AM',
    status: 'Completed',
    participantsCount: 16,
    duration: '90 mins',
  },
  {
    id: 'p4',
    code: 'P104',
    nameMl: 'നഅ്ത് ശരീഫ് ആലാപനം',
    nameEn: 'Naat Shareef Recitation',
    category: 'Senior',
    type: 'Individual',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    venueCode: 'V1',
    date: '12 റബീഉൽ അവ്വൽ',
    time: '02:00 PM',
    status: 'Live',
    participantsCount: 14,
    duration: '75 mins',
  },
  {
    id: 'p5',
    code: 'P105',
    nameMl: 'ഇസ്‌ലാമിക് പ്രസംഗം (മലയാളം)',
    nameEn: 'Islamic Speech (Malayalam)',
    category: 'Senior',
    type: 'Individual',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    venueCode: 'V1',
    date: '12 റബീഉൽ അവ്വൽ',
    time: '03:30 PM',
    status: 'Live',
    participantsCount: 12,
    duration: '90 mins',
  },
  {
    id: 'p6',
    code: 'P106',
    nameMl: 'ഇംഗ്ലീഷ് പ്രസംഗം',
    nameEn: 'English Speech',
    category: 'Senior',
    type: 'Individual',
    venue: 'വേദി 3: ഹറം ഹാൾ',
    venueCode: 'V3',
    date: '12 റബീഉൽ അവ്വൽ',
    time: '04:15 PM',
    status: 'Upcoming',
    participantsCount: 8,
    duration: '60 mins',
  },
  {
    id: 'p7',
    code: 'P107',
    nameMl: 'ദഫ് മുട്ട് മത്സരം',
    nameEn: 'Duffmutt Performance',
    category: 'General',
    type: 'Group',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    venueCode: 'V1',
    date: '12 റബീഉൽ അവ്വൽ',
    time: '07:30 PM',
    status: 'Upcoming',
    participantsCount: 4,
    duration: '120 mins',
  },
  {
    id: 'p8',
    code: 'P108',
    nameMl: 'ഇസ്‌ലാമിക് സംഘഗാനം',
    nameEn: 'Group Song (Islamic)',
    category: 'Junior',
    type: 'Group',
    venue: 'വേദി 2: മദീന നഗർ',
    venueCode: 'V2',
    date: '12 റബീഉൽ അവ്വൽ',
    time: '08:15 PM',
    status: 'Upcoming',
    participantsCount: 4,
    duration: '90 mins',
  },
  {
    id: 'p9',
    code: 'P109',
    nameMl: 'അറബിക് കാലിഗ്രാഫി',
    nameEn: 'Arabic Calligraphy',
    category: 'Senior',
    type: 'Individual',
    venue: 'വേദി 3: ഹറം ഹാൾ',
    venueCode: 'V3',
    date: '13 റബീഉൽ അവ്വൽ',
    time: '09:30 AM',
    status: 'Upcoming',
    participantsCount: 15,
    duration: '120 mins',
  },
  {
    id: 'p10',
    code: 'P110',
    nameMl: 'ഇസ്‌ലാമിക് ക്വിസ്',
    nameEn: 'Islamic Grand Quiz',
    category: 'Senior',
    type: 'Group',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    venueCode: 'V1',
    date: '13 റബീഉൽ അവ്വൽ',
    time: '11:00 AM',
    status: 'Upcoming',
    participantsCount: 4,
    duration: '90 mins',
  },
  {
    id: 'p11',
    code: 'P111',
    nameMl: 'മൗലിദ് പാരായണ മത്സരം',
    nameEn: 'Mawlid Majlis Recitation',
    category: 'General',
    type: 'Group',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    venueCode: 'V1',
    date: '13 റബീഉൽ അവ്വൽ',
    time: '02:30 PM',
    status: 'Upcoming',
    participantsCount: 4,
    duration: '100 mins',
  },
  {
    id: 'p12',
    code: 'P112',
    nameMl: 'കഥാപ്രസംഗം',
    nameEn: 'Kadhaprasangam Storytelling',
    category: 'Senior',
    type: 'Individual',
    venue: 'വേദി 2: മദീന നഗർ',
    venueCode: 'V2',
    date: '13 റബീഉൽ അവ്വൽ',
    time: '04:30 PM',
    status: 'Upcoming',
    participantsCount: 6,
    duration: '90 mins',
  },
];

export const SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    day: 'Day 1',
    hijriDate: '12 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 15, ചൊവ്വ',
    timeSlot: '08:30 AM - 09:00 AM',
    programCode: 'INF01',
    programNameMl: 'ഉദ്ഘാടന സമ്മേളനവും പതാക ഉയർത്തലും',
    programNameEn: 'Inauguration & Flag Hoisting',
    category: 'General',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    status: 'Completed',
    session: 'Morning',
  },
  {
    id: 's2',
    day: 'Day 1',
    hijriDate: '12 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 15, ചൊവ്വ',
    timeSlot: '09:00 AM - 10:15 AM',
    programCode: 'P101',
    programNameMl: 'ഖുർആൻ പാരായണം',
    programNameEn: 'Quran Tilawat',
    category: 'Sub-Junior',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    status: 'Completed',
    session: 'Morning',
  },
  {
    id: 's3',
    day: 'Day 1',
    hijriDate: '12 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 15, ചൊവ്വ',
    timeSlot: '10:00 AM - 11:15 AM',
    programCode: 'P102',
    programNameMl: 'ഹിഫ്ള് പാരായണം',
    programNameEn: 'Hifdh Recitation',
    category: 'Junior',
    venue: 'വേദി 3: ഹറം ഹാൾ',
    status: 'Completed',
    session: 'Morning',
  },
  {
    id: 's4',
    day: 'Day 1',
    hijriDate: '12 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 15, ചൊവ്വ',
    timeSlot: '11:15 AM - 01:00 PM',
    programCode: 'P103',
    programNameMl: 'അറബിക് ഗാനം',
    programNameEn: 'Arabic Song',
    category: 'Junior',
    venue: 'വേദി 2: മദീന നഗർ',
    status: 'Completed',
    session: 'Morning',
  },
  {
    id: 's5',
    day: 'Day 1',
    hijriDate: '12 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 15, ചൊവ്വ',
    timeSlot: '02:00 PM - 03:30 PM',
    programCode: 'P104',
    programNameMl: 'നഅ്ത് ശരീഫ് ആലാപനം',
    programNameEn: 'Naat Shareef Recitation',
    category: 'Senior',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    status: 'Live',
    session: 'Afternoon',
  },
  {
    id: 's6',
    day: 'Day 1',
    hijriDate: '12 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 15, ചൊവ്വ',
    timeSlot: '03:30 PM - 05:00 PM',
    programCode: 'P105',
    programNameMl: 'ഇസ്‌ലാമിക് പ്രസംഗം (മലയാളം)',
    programNameEn: 'Islamic Speech (Malayalam)',
    category: 'Senior',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    status: 'Live',
    session: 'Afternoon',
  },
  {
    id: 's7',
    day: 'Day 1',
    hijriDate: '12 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 15, ചൊവ്വ',
    timeSlot: '04:15 PM - 05:30 PM',
    programCode: 'P106',
    programNameMl: 'ഇംഗ്ലീഷ് പ്രസംഗം',
    programNameEn: 'English Speech',
    category: 'Senior',
    venue: 'വേദി 3: ഹറം ഹാൾ',
    status: 'Upcoming',
    session: 'Evening',
  },
  {
    id: 's8',
    day: 'Day 1',
    hijriDate: '12 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 15, ചൊവ്വ',
    timeSlot: '07:30 PM - 09:30 PM',
    programCode: 'P107',
    programNameMl: 'ദഫ് മുട്ട് മത്സരം',
    programNameEn: 'Duffmutt Performance',
    category: 'General',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    status: 'Upcoming',
    session: 'Night',
  },
  {
    id: 's9',
    day: 'Day 2',
    hijriDate: '13 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 16, ബുധൻ',
    timeSlot: '09:00 AM - 11:00 AM',
    programCode: 'P109',
    programNameMl: 'അറബിക് കാലിഗ്രാഫി',
    programNameEn: 'Arabic Calligraphy',
    category: 'Senior',
    venue: 'വേദി 3: ഹറം ഹാൾ',
    status: 'Upcoming',
    session: 'Morning',
  },
  {
    id: 's10',
    day: 'Day 2',
    hijriDate: '13 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 16, ബുധൻ',
    timeSlot: '11:00 AM - 01:00 PM',
    programCode: 'P110',
    programNameMl: 'ഇസ്‌ലാമിക് ക്വിസ് ഗ്രാൻഡ് ഫിനാലെ',
    programNameEn: 'Islamic Grand Quiz Finale',
    category: 'Senior',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    status: 'Upcoming',
    session: 'Morning',
  },
  {
    id: 's11',
    day: 'Day 2',
    hijriDate: '13 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 16, ബുധൻ',
    timeSlot: '02:30 PM - 04:30 PM',
    programCode: 'P111',
    programNameMl: 'മൗലിദ് പാരായണ മത്സരം',
    programNameEn: 'Mawlid Majlis Recitation',
    category: 'General',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    status: 'Upcoming',
    session: 'Afternoon',
  },
  {
    id: 's12',
    day: 'Day 2',
    hijriDate: '13 റബീഉൽ അവ്വൽ 1446',
    gregorianDate: 'സെപ്റ്റംബർ 16, ബുധൻ',
    timeSlot: '07:30 PM - 10:00 PM',
    programCode: 'CLO01',
    programNameMl: 'മിലാദ് സമാപന സമ്മേളനവും അവാർഡ് ദാനവും',
    programNameEn: 'Grand Valedictory & Prize Distribution',
    category: 'General',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    status: 'Upcoming',
    session: 'Night',
  },
];

export const RESULTS: ProgramResult[] = [
  {
    id: 'r1',
    programCode: 'P101',
    programNameMl: 'ഖുർആൻ പാരായണം',
    programNameEn: 'Quran Tilawat',
    category: 'Sub-Junior',
    type: 'Individual',
    venue: 'വേദി 1: ഇമാം ഗസ്സാലി നഗർ',
    date: '12 റബീഉൽ അവ്വൽ',
    winners: [
      {
        position: 1,
        nameMl: 'മുഹമ്മദ് റയ്യാൻ',
        nameEn: 'Muhammed Rayyan',
        teamId: 'farqan',
        teamNameMl: 'ഫർഖാന്മാർ',
        teamColor: '#059669',
        chestNo: 'FRQ-104',
        grade: 'A',
        points: 10,
      },
      {
        position: 2,
        nameMl: 'അഹ്മദ് സഫുവാൻ',
        nameEn: 'Ahammed Safwan',
        teamId: 'salsabeel',
        teamNameMl: 'സൽസബീൽ',
        teamColor: '#d97706',
        chestNo: 'SLS-112',
        grade: 'A',
        points: 7,
      },
      {
        position: 3,
        nameMl: 'മുഹമ്മദ് അബ്ദുല്ല',
        nameEn: 'Muhammed Abdullah',
        teamId: 'rayyan',
        teamNameMl: 'റയ്യാന്മാർ',
        teamColor: '#2563eb',
        chestNo: 'RYN-109',
        grade: 'A',
        points: 5,
      },
    ],
  },
  {
    id: 'r2',
    programCode: 'P102',
    programNameMl: 'ഹിഫ്ള് പാരായണം',
    programNameEn: 'Hifdh Recitation',
    category: 'Junior',
    type: 'Individual',
    venue: 'വേദി 3: ഹറം ഹാൾ',
    date: '12 റബീഉൽ അവ്വൽ',
    winners: [
      {
        position: 1,
        nameMl: 'ഹാഫിള് അബ്ദുൽ ബാസിത്',
        nameEn: 'Hafiz Abdul Basith',
        teamId: 'rayyan',
        teamNameMl: 'റയ്യാന്മാർ',
        teamColor: '#2563eb',
        chestNo: 'RYN-201',
        grade: 'A',
        points: 10,
      },
      {
        position: 2,
        nameMl: 'മുഹമ്മദ് സൽമാൻ',
        nameEn: 'Muhammed Salman',
        teamId: 'farqan',
        teamNameMl: 'ഫർഖാന്മാർ',
        teamColor: '#059669',
        chestNo: 'FRQ-208',
        grade: 'A',
        points: 7,
      },
      {
        position: 3,
        nameMl: 'ഇബ്രാഹിം ഖലീൽ',
        nameEn: 'Ibrahim Khaleel',
        teamId: 'sufiyan',
        teamNameMl: 'സൂഫിയാൻ',
        teamColor: '#7c3aed',
        chestNo: 'SFN-215',
        grade: 'B',
        points: 4,
      },
    ],
  },
  {
    id: 'r3',
    programCode: 'P103',
    programNameMl: 'അറബിക് ഗാനം',
    programNameEn: 'Arabic Song',
    category: 'Junior',
    type: 'Individual',
    venue: 'വേദി 2: മദീന നഗർ',
    date: '12 റബീഉൽ അവ്വൽ',
    winners: [
      {
        position: 1,
        nameMl: 'സിനാൻ അഹ്മദ്',
        nameEn: 'Sinan Ahammed',
        teamId: 'salsabeel',
        teamNameMl: 'സൽസബീൽ',
        teamColor: '#d97706',
        chestNo: 'SLS-205',
        grade: 'A',
        points: 10,
      },
      {
        position: 2,
        nameMl: 'മുഹമ്മദ് നാഫിഹ്',
        nameEn: 'Muhammed Nafi',
        teamId: 'farqan',
        teamNameMl: 'ഫർഖാന്മാർ',
        teamColor: '#059669',
        chestNo: 'FRQ-212',
        grade: 'A',
        points: 7,
      },
      {
        position: 3,
        nameMl: 'അമീൻ റഷാദ്',
        nameEn: 'Ameen Rashad',
        teamId: 'sufiyan',
        teamNameMl: 'സൂഫിയാൻ',
        teamColor: '#7c3aed',
        chestNo: 'SFN-202',
        grade: 'B',
        points: 4,
      },
    ],
  },
  {
    id: 'r4',
    programCode: 'P108',
    programNameMl: 'ഇസ്‌ലാമിക് സംഘഗാനം',
    programNameEn: 'Group Song (Islamic)',
    category: 'Junior',
    type: 'Group',
    venue: 'വേദി 2: മദീന നഗർ',
    date: '12 റബീഉൽ അവ്വൽ',
    winners: [
      {
        position: 1,
        nameMl: 'ഫർഖാന്മാർ ഗ്രൂപ്പ് A',
        nameEn: 'Team Farqan Group A',
        teamId: 'farqan',
        teamNameMl: 'ഫർഖാന്മാർ',
        teamColor: '#059669',
        chestNo: 'FRQ-GRP1',
        grade: 'A',
        points: 15,
      },
      {
        position: 2,
        nameMl: 'റയ്യാന്മാർ ഗ്രൂപ്പ് A',
        nameEn: 'Team Rayyan Group A',
        teamId: 'rayyan',
        teamNameMl: 'റയ്യാന്മാർ',
        teamColor: '#2563eb',
        chestNo: 'RYN-GRP1',
        grade: 'A',
        points: 10,
      },
      {
        position: 3,
        nameMl: 'സൽസബീൽ ഗ്രൂപ്പ് B',
        nameEn: 'Team Salsabeel Group B',
        teamId: 'salsabeel',
        teamNameMl: 'സൽസബീൽ',
        teamColor: '#d97706',
        chestNo: 'SLS-GRP1',
        grade: 'B',
        points: 6,
      },
    ],
  },
];

export const GALLERY: GalleryItem[] = [
  {
    id: 'g1',
    titleMl: 'പതാക ഉയർത്തലും ഉദ്ഘാടന ചടങ്ങും',
    titleEn: 'Flag Hoisting & Grand Inauguration',
    category: 'Inauguration',
    categoryMl: 'ഉദ്ഘാടനം',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1542816417-0983cbe82752?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1542816417-0983cbe82752?q=80&w=600&auto=format&fit=crop',
    date: '12 റബീഉൽ അവ്വൽ',
    captionMl: 'ചിറക്കൽ മഹല്ല് ഖാസി പതാക ഉയർത്തുന്നു',
  },
  {
    id: 'g2',
    titleMl: 'സുബ് ജൂനിയർ ഖുർആൻ മത്സരവേദി',
    titleEn: 'Sub-Junior Quran Recitation Stage',
    category: 'Competitions',
    categoryMl: 'മത്സരങ്ങൾ',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop',
    date: '12 റബീഉൽ അവ്വൽ',
    captionMl: 'ഇമാം ഗസ്സാലി നഗറിൽ നടക്കുന്ന ഖുർആൻ പാരായണം',
  },
  {
    id: 'g3',
    titleMl: 'ആവേശം വിതറി ദഫ് മുട്ട് മത്സരം',
    titleEn: 'Energetic Duffmutt Performance',
    category: 'Duffmutt',
    categoryMl: 'ദഫ് മുട്ട്',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    date: '12 റബീഉൽ അവ്വൽ',
    captionMl: 'തൻവീറുൽ ഇസ്‌ലാം ദഫ് ടീമിന്റെ വർണ്ണാഭമായ അവതരണം',
  },
  {
    id: 'g4',
    titleMl: 'മൗലിദ് മജ്‌ലിസ് പ്രാർത്ഥനാ സദസ്സ്',
    titleEn: 'Mawlid Majlis Prayer Gathering',
    category: 'Majlis',
    categoryMl: 'സലാത്ത് മജ്‌ലിസ്',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=600&auto=format&fit=crop',
    date: '12 റബീഉൽ അവ്വൽ',
    captionMl: 'റബീഉൽ അവ്വൽ പുണ്യ ദിനത്തിലെ കൂട്ട പ്രാർത്ഥന',
  },
  {
    id: 'g5',
    titleMl: 'വിജയികൾക്കുള്ള ട്രോഫി വിതരണം',
    titleEn: 'Trophy Distribution to Champions',
    category: 'Prizes',
    categoryMl: 'സമ്മാനദാനം',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?q=80&w=600&auto=format&fit=crop',
    date: '12 റബീഉൽ അവ്വൽ',
    captionMl: 'ഒന്നാം സ്ഥാനം നേടിയ വിജയികൾ ട്രോഫി ഏറ്റുവാങ്ങുന്നു',
  },
  {
    id: 'g6',
    titleMl: 'അറബിക് ഗാനാലാപനം - ജൂനിയർ',
    titleEn: 'Arabic Song Competition - Junior',
    category: 'Competitions',
    categoryMl: 'മത്സരങ്ങൾ',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    date: '12 റബീഉൽ അവ്വൽ',
    captionMl: 'മദീന നഗർ വേദിയിലെ മനോഹര ഗാനാലാപനം',
  },
];
