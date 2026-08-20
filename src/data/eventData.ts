export interface ProgrammeItem {
  id: string;
  code: string;
  titleEn: string;
  titleMl: string;
  arabicTitle?: string;
  timeSlotEn: string;
  timeSlotMl: string;
  categoryEn: string;
  categoryMl: string;
  descriptionEn: string;
  descriptionMl: string;
}

export interface GalleryMedia {
  id: string;
  titleEn: string;
  titleMl: string;
  categoryEn: string;
  categoryMl: string;
  imageUrl: string;
  isPlaceholder: boolean;
}

export const EVENT_DETAILS = {
  nameEn: 'Rowlathul Madeena Milad Fest - 2K26',
  nameMl: 'റൗളത്തുൽ മദീന മീലാദ് ഫെസ്റ്റ് - 2K26',
  arabicBismillah: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
  arabicDurood: 'اللهم صل وسلم على نبينا محمد ﷺ',
  dateIso: '2026-08-29T00:00:00+05:30', // Asia/Kolkata timezone
  dateFormattedEn: 'August 29, 2026 • Saturday',
  dateFormattedMl: '2026 ആഗസ്റ്റ് 29 • ശനിയാഴ്ച',
  venueEn: 'Al Ihsan Sunni Madrassa, Karingari',
  venueMl: 'അൽ ഇഹ്സാൻ സുന്നി മദ്രസ കരിങ്ങാരി',
  mapUrl: 'https://maps.google.com/?q=Al+Ihsan+Sunni+Madrassa+Karingari',
  mapEmbedSrc: 'https://maps.google.com/maps?q=Karingari+Kerala&t=&z=14&ie=UTF8&iwloc=&output=embed',
  isProgrammeAnnounced: false, // Flag to indicate if real schedule is published
};

// Programme Schedule - Uses placeholder notice until official schedule release
export const PROGRAMMES_PLACEHOLDER_TEXT = {
  titleEn: 'Programme Details Will Be Announced Soon',
  titleMl: 'പ്രോഗ്രാം വിവരങ്ങൾ ഉടൻ അറിയിക്കുന്നതാണ്',
  subtitleEn: 'The committee is currently finalizing the official event schedule, guest speakers, and competition timings. Please check back soon for updates.',
  subtitleMl: 'ഔദ്യോഗിക പ്രോഗ്രാം ഷെഡ്യൂളും സമയക്രമവും അന്തിമഘട്ടത്തിലാണ്. പുതിയ വിവരങ്ങൾക്കായി ഈ പേജ് വീണ്ടും സന്ദർശിക്കുക.',
};

// Clean data structure ready for updating with real programme items
export const PROGRAMMES: ProgrammeItem[] = [
  {
    id: 'prg-placeholder-1',
    code: 'SESSION 1',
    titleEn: 'Morning Inaugural Session',
    titleMl: 'രാവിലെ ഉദ്ഘാടന സദസ്സ്',
    arabicTitle: 'افتتاح وقراءة المولد النبوي الشريف',
    timeSlotEn: 'Morning Session',
    timeSlotMl: 'രാവിലെ സദസ്സ്',
    categoryEn: 'Inauguration & Mawlid',
    categoryMl: 'ഉദ്ഘാടനവും മൗലിദും',
    descriptionEn: 'Flag hoisting ceremony, Mawlid Shareef recitation, and welcome address. Details will be updated soon.',
    descriptionMl: 'പതാക ഉയർത്തലും മൗലിദ് പാരായണവും സ്വാഗത പ്രസംഗവും. കൂടുതൽ വിവരങ്ങൾ ഉടൻ അപ്‌ഡേറ്റ് ചെയ്യുന്നതാണ്.',
  },
  {
    id: 'prg-placeholder-2',
    code: 'SESSION 2',
    titleEn: 'Cultural & Academic Competitions',
    titleMl: 'കലാ സാഹിത്യ മത്സരങ്ങൾ',
    arabicTitle: 'المسابقات الثقافية والعلمية',
    timeSlotEn: 'Day Session',
    timeSlotMl: 'പകൽ സദസ്സ്',
    categoryEn: 'Competitions',
    categoryMl: 'കലാ മത്സരങ്ങൾ',
    descriptionEn: 'Quran recitation, Islamic speeches, Duffmutt, and qasida competitions. Timing chart will be announced soon.',
    descriptionMl: 'ഖുർആൻ പാരായണം, പ്രസംഗം, ദഫ് മുട്ട്, അറബിക് ഗാന മത്സരങ്ങൾ. തത്സമയ സമയക്രമം ഉടൻ പുറത്തുവിടും.',
  },
  {
    id: 'prg-placeholder-3',
    code: 'SESSION 3',
    titleEn: 'Grand Valedictory & Public Gathering',
    titleMl: 'സമാപന പൊതുസമ്മേളനം',
    arabicTitle: 'الحفل الختامي وتوزيع الجوائز',
    timeSlotEn: 'Evening & Night',
    timeSlotMl: 'വൈകുന്നേരവും രാത്രിയും',
    categoryEn: 'Valedictory & Prize Distribution',
    categoryMl: 'സമാപന സമ്മേളനവും സമ്മാനദാനവും',
    descriptionEn: 'Spiritual discourse by invited scholars and distribution of prizes to winners. Final speaker list will be updated soon.',
    descriptionMl: 'പണ്ഡിതരുടെ പ്രഭാഷണവും വിജയികൾക്കുള്ള അവാർഡ് ദാനവും. പ്രഭാഷകരുടെ വിവരം ഉടൻ പ്രസിദ്ധീകരിക്കും.',
  },
];

// Gallery Media - Includes clean placeholders for posters & event photos
export const GALLERY_ITEMS: GalleryMedia[] = [
  {
    id: 'poster-1',
    titleEn: 'Official Fest Poster Placeholder',
    titleMl: 'ഔദ്യോഗിക മീലാദ് ഫെസ്റ്റ് പോസ്റ്റർ',
    categoryEn: 'Event Poster',
    categoryMl: 'പോസ്റ്ററുകൾ',
    imageUrl: 'https://images.unsplash.com/photo-1542816417-0983cbe82752?q=80&w=1200&auto=format&fit=crop',
    isPlaceholder: true,
  },
  {
    id: 'stage-1',
    titleEn: 'Madrasa Venue & Stage Decoration Placeholder',
    titleMl: 'വേദിയും മദ്രസ പരിസരവും',
    categoryEn: 'Venue & Stage',
    categoryMl: 'വേദി സമുച്ചയം',
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1200&auto=format&fit=crop',
    isPlaceholder: true,
  },
  {
    id: 'event-1',
    titleEn: 'Cultural Event Highlights Placeholder',
    titleMl: 'ആഘോഷ ചടങ്ങുകൾ',
    categoryEn: 'Cultural Events',
    categoryMl: 'കലാചടങ്ങുകൾ',
    imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop',
    isPlaceholder: true,
  },
  {
    id: 'event-2',
    titleEn: 'Duffmutt Performance Placeholder',
    titleMl: 'ദഫ് മുട്ട് പ്രകടനം',
    categoryEn: 'Performances',
    categoryMl: 'കലാപ്രകടനങ്ങൾ',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    isPlaceholder: true,
  },
  {
    id: 'prize-1',
    titleEn: 'Awards & Trophies Placeholder',
    titleMl: 'അവാർഡുകളും ട്രോഫികളും',
    categoryEn: 'Awards',
    categoryMl: 'സമ്മാനദാനം',
    imageUrl: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?q=80&w=1200&auto=format&fit=crop',
    isPlaceholder: true,
  },
  {
    id: 'event-3',
    titleEn: 'Community Gathering Placeholder',
    titleMl: 'പൊതുസമ്മേളനം',
    categoryEn: 'Gathering',
    categoryMl: 'പൊതുസദസ്സ്',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    isPlaceholder: true,
  },
];
