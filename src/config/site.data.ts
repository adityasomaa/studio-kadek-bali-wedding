/* ============================================================================
 * SITE CONTENT DATA
 *
 * This file holds the lists a non-technical editor is most likely to want to
 * change: the service packages, the gallery categories, and the steps in
 * "how we work".
 *
 * Editing rules, please read before changing anything:
 *   1. Every piece of text exists twice: `id` is Indonesian, `en` is English.
 *      Change both, otherwise one language will look unfinished.
 *   2. Do NOT add prices. Packages are quoted per event; the site sends people
 *      to a consultation instead.
 *   3. Do NOT add venue names, vendor company names, client names, review
 *      counts, years in business, or number of weddings handled. Only the
 *      neutral categories that are already here.
 *   4. `key` is a technical id used by the code (URLs, graphics filenames).
 *      Changing a `key` means the matching SVG in /public/graphics must be
 *      regenerated: run `npm run graphics`.
 * ==========================================================================*/

export type Bilingual = { id: string; en: string }

/* -------------------------------------------------------------------------
 * 1. SERVICE PACKAGES
 * Three levels of involvement. `scope` is what the package covers.
 * `boundary` states plainly where the responsibility stops. That section is
 * here on purpose: unclear scope is the most common source of friction.
 * -----------------------------------------------------------------------*/
export type Package = {
  key: string
  name: Bilingual
  tagline: Bilingual
  summary: Bilingual
  bestFor: Bilingual
  scope: { id: string[]; en: string[] }
  boundary: { id: string[]; en: string[] }
}

export const packages: Package[] = [
  {
    key: 'full',
    name: { id: 'Full Wedding Organizer', en: 'Full Wedding Organizer' },
    tagline: {
      id: 'Pendampingan dari perencanaan awal sampai acara selesai',
      en: 'Support from early planning through to the end of the event',
    },
    summary: {
      id: 'Kami mendampingi sejak konsep belum terbentuk: menyusun rencana, mencari dan mengatur vendor, menjaga anggaran tetap terbaca, lalu menjalankan acara di hari H. Cocok untuk pasangan yang waktunya terbatas atau sedang tidak berada di Bali.',
      en: 'We come in before the concept exists: building the plan, sourcing and coordinating vendors, keeping the budget readable, then running the day itself. Suited to couples with limited time, or planning from outside Bali.',
    },
    bestFor: {
      id: 'Pasangan yang merencanakan dari luar kota atau luar negeri',
      en: 'Couples planning from another city or another country',
    },
    scope: {
      id: [
        'Konsultasi konsep, skala acara, dan penyusunan tanggal',
        'Penyusunan rencana anggaran dan pencatatan pengeluaran',
        'Pencarian, penyaringan, dan koordinasi vendor lintas kategori',
        'Survei lokasi dan pengaturan jadwal kunjungan',
        'Penyusunan rundown, denah, dan daftar kebutuhan teknis',
        'Koordinasi gladi bersih bersama seluruh vendor',
        'Pengelolaan jalannya acara di hari H oleh tim di lokasi',
      ],
      en: [
        'Consultation on concept, scale of the event, and date planning',
        'Budget plan and a running record of expenses',
        'Sourcing, shortlisting, and coordinating vendors across categories',
        'Site visits and scheduling of venue inspections',
        'Rundown, floor plan, and technical requirement list',
        'Rehearsal coordination with all vendors',
        'On-site management of the event day by the team',
      ],
    },
    boundary: {
      id: [
        'Pembayaran ke vendor tetap dilakukan atas nama dan persetujuan klien',
        'Keputusan akhir atas pilihan vendor, menu, dan konsep ada pada klien',
        'Layanan vendor itu sendiri, seperti dekorasi, katering, dokumentasi, dan rias, berada di bawah kontrak masing-masing vendor',
        'Perizinan yang menjadi kewenangan pihak lokasi atau instansi mengikuti ketentuan pihak tersebut',
      ],
      en: [
        'Vendor payments stay in the client name and need the client approval',
        'Final decisions on vendors, menu, and concept stay with the client',
        'The vendor services themselves, such as decor, catering, documentation, and make-up, sit under each vendor own contract',
        'Permits held by the venue or a government body follow that party terms',
      ],
    },
  },
  {
    key: 'partial',
    name: { id: 'Partial Wedding Organizer', en: 'Partial Wedding Organizer' },
    tagline: {
      id: 'Melanjutkan rencana yang sudah Anda mulai',
      en: 'Picking up a plan you have already started',
    },
    summary: {
      id: 'Sebagian persiapan sudah berjalan, misalnya lokasi sudah dipesan dan beberapa vendor sudah dipilih. Kami masuk untuk melengkapi bagian yang belum terisi, merapikan koordinasi antar vendor, dan menyiapkan pelaksanaan hari H.',
      en: 'Part of the preparation is already underway, for example the venue is booked and a few vendors are chosen. We step in to fill the gaps, tidy up coordination between vendors, and prepare the event day.',
    },
    bestFor: {
      id: 'Pasangan yang sudah punya sebagian vendor dan lokasi',
      en: 'Couples who already have some vendors and a venue',
    },
    scope: {
      id: [
        'Peninjauan rencana yang sudah berjalan dan pencatatan bagian yang belum lengkap',
        'Pencarian vendor untuk kategori yang masih kosong',
        'Koordinasi jadwal dan kebutuhan teknis antar vendor',
        'Penyusunan rundown dan denah acara',
        'Koordinasi gladi bersih',
        'Pengelolaan jalannya acara di hari H oleh tim di lokasi',
      ],
      en: [
        'Review of the existing plan and a written list of what is still open',
        'Sourcing vendors for the categories still unfilled',
        'Coordinating schedules and technical needs between vendors',
        'Rundown and floor plan',
        'Rehearsal coordination',
        'On-site management of the event day by the team',
      ],
    },
    boundary: {
      id: [
        'Kontrak vendor yang sudah ditandatangani sebelumnya tetap mengikat sesuai isinya',
        'Perubahan pada vendor yang sudah dipesan mengikuti ketentuan vendor tersebut',
        'Penyusunan anggaran menyeluruh tidak termasuk, kecuali disepakati terpisah',
        'Layanan vendor berada di bawah kontrak masing-masing vendor',
      ],
      en: [
        'Vendor contracts signed earlier stay binding as written',
        'Changes to vendors already booked follow that vendor own terms',
        'Full budget planning is not included unless agreed separately',
        'Vendor services sit under each vendor own contract',
      ],
    },
  },
  {
    key: 'day-coordinator',
    name: { id: 'Day Coordinator', en: 'Day Coordinator' },
    tagline: {
      id: 'Anda yang menyiapkan, kami yang menjalankan hari H',
      en: 'You prepare it, we run the day',
    },
    summary: {
      id: 'Untuk pasangan yang sudah menyiapkan hampir semuanya sendiri dan hanya butuh tim yang menjalankan hari H. Kami mempelajari rencana Anda beberapa waktu sebelum acara, menyusun rundown final, lalu memastikan urutan acara berjalan sesuai rencana tersebut.',
      en: 'For couples who have arranged nearly everything themselves and only need a team to run the day. We study your plan some weeks before, build the final rundown, then keep the sequence of the day moving to that plan.',
    },
    bestFor: {
      id: 'Pasangan yang sudah menyiapkan sendiri seluruh vendor',
      en: 'Couples who have arranged every vendor themselves',
    },
    scope: {
      id: [
        'Pertemuan serah terima rencana dan penyesuaian rundown final',
        'Konfirmasi jadwal kedatangan kepada seluruh vendor menjelang acara',
        'Koordinasi gladi bersih bila dijadwalkan',
        'Pengaturan urutan acara dan aba-aba di hari H',
        'Titik kontak tunggal bagi vendor dan keluarga selama acara berlangsung',
      ],
      en: [
        'Handover meeting and adjustment of the final rundown',
        'Confirming arrival times with every vendor ahead of the event',
        'Rehearsal coordination where one is scheduled',
        'Running the sequence and the cues on the day',
        'A single point of contact for vendors and family during the event',
      ],
    },
    boundary: {
      id: [
        'Pencarian dan pemilihan vendor tidak termasuk',
        'Negosiasi harga dan penyusunan anggaran tidak termasuk',
        'Kesepakatan yang sudah dibuat langsung antara klien dan vendor tetap berlaku apa adanya',
        'Persiapan sebelum periode serah terima berada di tangan klien',
      ],
      en: [
        'Vendor sourcing and selection are not included',
        'Price negotiation and budget planning are not included',
        'Agreements made directly between client and vendor stand as they are',
        'Preparation before the handover period stays with the client',
      ],
    },
  },
]

/* -------------------------------------------------------------------------
 * 2. GALLERY CATEGORIES
 * These are event types, not venues. Each key has its own generated graphic
 * family in /public/graphics so the categories read differently at a glance.
 * -----------------------------------------------------------------------*/
export type GalleryCategory = {
  key: string
  label: Bilingual
  blurb: Bilingual
  /** How many placeholder graphics exist for this category. */
  count: number
}

export const galleryCategories: GalleryCategory[] = [
  {
    key: 'intimate',
    label: { id: 'Intimate Wedding', en: 'Intimate Wedding' },
    blurb: {
      id: 'Acara berskala kecil dengan daftar tamu terbatas.',
      en: 'Small-scale events with a limited guest list.',
    },
    count: 6,
  },
  {
    key: 'beach',
    label: { id: 'Beach Wedding', en: 'Beach Wedding' },
    blurb: {
      id: 'Acara di tepi pantai, dengan pertimbangan cuaca dan pasang surut.',
      en: 'Seaside events, planned around weather and tide.',
    },
    count: 6,
  },
  {
    key: 'traditional',
    label: { id: 'Adat dan Tradisional', en: 'Traditional Ceremony' },
    blurb: {
      id: 'Rangkaian upacara adat dengan urutan dan perlengkapannya.',
      en: 'Customary ceremonies with their own sequence and requirements.',
    },
    count: 6,
  },
  {
    key: 'reception',
    label: { id: 'Resepsi', en: 'Reception' },
    blurb: {
      id: 'Jamuan setelah upacara, dari penyambutan tamu sampai hiburan.',
      en: 'The gathering after the ceremony, from guest arrival to entertainment.',
    },
    count: 6,
  },
]

/* -------------------------------------------------------------------------
 * 3. HOW WE WORK, the numbered process
 * Keep these in order. The numbers on the page come from the array position.
 * -----------------------------------------------------------------------*/
export type ProcessStep = {
  key: string
  title: Bilingual
  body: Bilingual
  /** What the couple ends up holding after this step. */
  output: Bilingual
}

export const processSteps: ProcessStep[] = [
  {
    key: 'consultation',
    title: { id: 'Konsultasi awal', en: 'First consultation' },
    body: {
      id: 'Percakapan pertama lewat WhatsApp atau panggilan video. Kami menanyakan gambaran acara, perkiraan jumlah tamu, dan rentang waktu yang Anda pertimbangkan. Belum ada yang mengikat pada tahap ini.',
      en: 'A first conversation over WhatsApp or a video call. We ask about the shape of the event, the rough guest count, and the time frame you are considering. Nothing is binding at this stage.',
    },
    output: { id: 'Gambaran kebutuhan dan arah paket', en: 'A picture of your needs and which package fits' },
  },
  {
    key: 'concept',
    title: { id: 'Penentuan konsep dan tanggal', en: 'Concept and date' },
    body: {
      id: 'Konsep acara dirapikan menjadi sesuatu yang bisa dikerjakan: skala, suasana, jenis lokasi, dan urutan acara secara garis besar. Tanggal ditetapkan setelah ketersediaan lokasi dan vendor utama diperiksa.',
      en: 'The concept is turned into something workable: scale, tone, type of location, and a rough order of events. The date is set once availability at the location and with the main vendors has been checked.',
    },
    output: { id: 'Konsep tertulis dan tanggal acara', en: 'A written concept and a confirmed date' },
  },
  {
    key: 'vendors',
    title: { id: 'Pemilihan vendor', en: 'Choosing vendors' },
    body: {
      id: 'Kami menyusun pilihan per kategori kebutuhan, menjelaskan perbedaannya, lalu Anda yang memutuskan. Setelah dipilih, jadwal dan kebutuhan teknis tiap vendor dicatat dalam satu daftar yang sama.',
      en: 'We put together options per category, explain how they differ, and you decide. Once chosen, each vendor schedule and technical needs go into one shared list.',
    },
    output: { id: 'Daftar vendor beserta jadwalnya', en: 'A vendor list with schedules attached' },
  },
  {
    key: 'rundown',
    title: { id: 'Penyusunan rundown', en: 'Building the rundown' },
    body: {
      id: 'Seluruh acara ditulis per satuan waktu, lengkap dengan siapa yang bertanggung jawab di tiap bagian dan apa yang harus sudah siap sebelumnya. Rundown ini dibagikan ke semua pihak yang terlibat.',
      en: 'The whole day is written out time slot by time slot, with who is responsible for each part and what needs to be ready beforehand. The rundown goes to everyone involved.',
    },
    output: { id: 'Rundown dan denah yang dibagikan', en: 'A shared rundown and floor plan' },
  },
  {
    key: 'rehearsal',
    title: { id: 'Gladi bersih', en: 'Rehearsal' },
    body: {
      id: 'Bagian yang melibatkan banyak orang dijalankan sekali di lokasi: urutan masuk, posisi berdiri, aba-aba, dan perpindahan antar sesi. Hal yang ternyata tidak berjalan diperbaiki di sini, bukan di hari H.',
      en: 'The parts that involve a lot of people are run once on location: entrance order, standing positions, cues, and the moves between sessions. Whatever does not work gets fixed here, not on the day.',
    },
    output: { id: 'Rundown final yang sudah diuji', en: 'A final rundown that has been tested' },
  },
  {
    key: 'wedding-day',
    title: { id: 'Hari H', en: 'The day itself' },
    body: {
      id: 'Tim berada di lokasi sejak persiapan dimulai. Vendor, keluarga, dan pengisi acara berkoordinasi lewat satu titik kontak, sehingga Anda tidak perlu menerima pertanyaan teknis sepanjang hari.',
      en: 'The team is on location from the moment setup begins. Vendors, family, and performers coordinate through one point of contact, so technical questions do not reach you during the day.',
    },
    output: { id: 'Acara berjalan mengikuti rundown', en: 'The day runs to the rundown' },
  },
]

/* -------------------------------------------------------------------------
 * 4. VENDOR CATEGORIES
 * Categories only. No company names: we do not publish partner lists.
 * -----------------------------------------------------------------------*/
export const vendorCategories: Bilingual[] = [
  { id: 'Dekorasi', en: 'Decor' },
  { id: 'Katering', en: 'Catering' },
  { id: 'Dokumentasi', en: 'Documentation' },
  { id: 'Rias dan busana', en: 'Hair, make-up and attire' },
  { id: 'Tata suara dan pencahayaan', en: 'Sound and lighting' },
  { id: 'Hiburan', en: 'Entertainment' },
]

/* -------------------------------------------------------------------------
 * 5. VENUE TYPES
 * Used in the consultation form and as location categories. Types, not names.
 * -----------------------------------------------------------------------*/
export const venueTypes: { key: string; label: Bilingual }[] = [
  { key: 'beach-club', label: { id: 'Beach club', en: 'Beach club' } },
  { key: 'villa', label: { id: 'Villa', en: 'Villa' } },
  { key: 'chapel', label: { id: 'Chapel', en: 'Chapel' } },
  { key: 'resort', label: { id: 'Resort atau hotel', en: 'Resort or hotel' } },
  { key: 'garden', label: { id: 'Taman terbuka', en: 'Open garden' } },
  { key: 'home', label: { id: 'Rumah atau lokasi keluarga', en: 'Home or family location' } },
  { key: 'undecided', label: { id: 'Belum ditentukan', en: 'Not decided yet' } },
]

/** Guest-count brackets offered in the consultation form. */
export const guestBrackets: { key: string; label: Bilingual }[] = [
  { key: 'lt-30', label: { id: 'Kurang dari 30 tamu', en: 'Fewer than 30 guests' } },
  { key: '30-80', label: { id: '30 sampai 80 tamu', en: '30 to 80 guests' } },
  { key: '80-150', label: { id: '80 sampai 150 tamu', en: '80 to 150 guests' } },
  { key: '150-300', label: { id: '150 sampai 300 tamu', en: '150 to 300 guests' } },
  { key: 'gt-300', label: { id: 'Lebih dari 300 tamu', en: 'More than 300 guests' } },
  { key: 'unsure', label: { id: 'Belum tahu', en: 'Not sure yet' } },
]
