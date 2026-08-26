import { client } from '@/config/client.config'
import type { Locale } from '@/i18n/routes'

/* ============================================================================
 * UI + PAGE COPY, both languages.
 *
 * Rules that this copy follows and that any edit must keep following:
 *   no prices, no ratings, no review counts, no number of weddings, no year
 *   founded, no testimonials, no couple names, no vendor names, no venue
 *   names, no "best" / "most trusted", and no promises about weather, date
 *   availability, or outcome.
 * ==========================================================================*/

const CITY = client.city
const REGION = client.region
const NAME = client.name
const PLACE = `${CITY}, ${REGION}`

const id = {
  htmlLang: 'id-ID',
  localeName: 'Bahasa Indonesia',
  localeShort: 'ID',

  nav: {
    home: 'Beranda',
    packages: 'Paket',
    gallery: 'Galeri',
    process: 'Cara Kerja',
    contact: 'Kontak',
    privacy: 'Kebijakan Privasi',
    terms: 'Syarat dan Ketentuan',
    menuOpen: 'Buka menu',
    menuClose: 'Tutup menu',
    menuLabel: 'Menu utama',
    skipToContent: 'Lewati ke konten utama',
    languageLabel: 'Pilih bahasa',
  },

  common: {
    consult: 'Mulai konsultasi',
    consultShort: 'Konsultasi',
    whatsapp: 'Chat WhatsApp',
    viewPackages: 'Lihat paket',
    viewGallery: 'Buka galeri',
    viewProcess: 'Lihat cara kerja',
    contactUs: 'Hubungi kami',
    readMore: 'Selengkapnya',
    showMore: 'Tampilkan lebih banyak',
    close: 'Tutup',
    previous: 'Sebelumnya',
    next: 'Berikutnya',
    scopeLabel: 'Yang kami kerjakan',
    boundaryLabel: 'Batas tanggung jawab',
    bestForLabel: 'Cocok untuk',
    outputLabel: 'Hasil tahap ini',
    stepLabel: 'Langkah',
    allCategories: 'Semua',
    galleryFilterLabel: 'Saring galeri berdasarkan jenis acara',
    graphicAlt: (category: string, n: number) =>
      `Grafis geometris ${n} untuk kategori ${category}. Ilustrasi sementara, bukan dokumentasi acara.`,
    lightboxLabel: 'Tampilan besar grafis galeri',
    loading: 'Memuat',
  },

  footer: {
    eyebrow: 'Konsultasi',
    headline: 'Ceritakan rencana acara Anda',
    description:
      'Kirim gambaran singkat lewat formulir konsultasi atau WhatsApp. Kami balas dengan pertanyaan lanjutan supaya kebutuhannya jelas lebih dulu.',
    ctaForm: 'Isi formulir konsultasi',
    ctaWhatsapp: 'Kirim pesan WhatsApp',
    based: `Wedding organizer di ${PLACE}`,
    rights: (year: number) => `© ${year} ${NAME}`,
    navLabel: 'Navigasi footer',
    legalLabel: 'Tautan legal',
    builtNote: 'Grafis di situs ini dibuat khusus dan bukan dokumentasi acara.',
  },

  cookie: {
    title: 'Cookie di situs ini',
    body:
      'Kami hanya memasang cookie analitik jika Anda mengizinkannya. Tanpa izin, tidak ada pengukuran yang dijalankan. Pilihan bahasa disimpan terpisah karena dibutuhkan agar situs berfungsi.',
    accept: 'Izinkan',
    reject: 'Tolak',
    more: 'Baca kebijakan privasi',
    label: 'Pemberitahuan cookie',
    manage: 'Pengaturan cookie',
    statusAccepted: 'Cookie analitik: diizinkan',
    statusRejected: 'Cookie analitik: ditolak',
    change: 'Ubah pilihan',
  },

  form: {
    title: 'Formulir konsultasi',
    intro:
      'Isi seadanya. Bagian yang belum pasti boleh dikosongkan atau ditandai belum ditentukan.',
    name: 'Nama',
    namePlaceholder: 'Nama Anda',
    phone: 'Nomor WhatsApp',
    phonePlaceholder: 'Contoh: 0812 3456 7890',
    date: 'Tanggal acara',
    dateUndecided: 'Tanggal belum ditentukan',
    datePlaceholder: 'Pilih tanggal',
    dateOpenCalendar: 'Buka kalender',
    guests: 'Perkiraan jumlah tamu',
    guestsPlaceholder: 'Pilih perkiraan',
    venue: 'Area atau jenis lokasi',
    venuePlaceholder: 'Pilih jenis lokasi',
    packageField: 'Paket yang diminati',
    packagePlaceholder: 'Pilih paket',
    packageUndecided: 'Belum tahu, tolong bantu pilih',
    notes: 'Catatan',
    notesPlaceholder: 'Hal lain yang perlu kami tahu',
    optional: 'opsional',
    submit: 'Kirim lewat WhatsApp',
    submitting: 'Menyiapkan pesan',
    successTitle: 'Pesan siap dikirim',
    successBody:
      'WhatsApp akan terbuka dengan isian Anda. Jika tidak terbuka otomatis, gunakan tautan di bawah ini.',
    successLink: 'Buka WhatsApp',
    errorTitle: 'Ada yang perlu diperbaiki',
    calendarLabel: 'Kalender pemilihan tanggal',
    monthPrevious: 'Bulan sebelumnya',
    monthNext: 'Bulan berikutnya',
    months: [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ],
    weekdays: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    weekdaysLong: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    errors: {
      name: 'Mohon isi nama.',
      nameLong: 'Nama terlalu panjang.',
      phone: 'Mohon isi nomor WhatsApp yang bisa dihubungi.',
      phoneFormat: 'Nomor hanya boleh berisi angka, spasi, tanda plus, dan tanda hubung.',
      date: 'Pilih tanggal acara, atau centang tanggal belum ditentukan.',
      datePast: 'Tanggal acara tidak boleh di masa lalu.',
      dateFar: 'Tanggal terlalu jauh. Hubungi kami langsung untuk rencana di atas lima tahun.',
      guests: 'Pilih perkiraan jumlah tamu.',
      venue: 'Pilih area atau jenis lokasi.',
      package: 'Pilih paket yang diminati.',
      notesLong: 'Catatan terlalu panjang, maksimal 1000 karakter.',
      generic: 'Data belum lengkap. Periksa bagian yang ditandai.',
    },
  },

  wa: {
    intro: 'Halo, saya ingin bertanya tentang layanan wedding organizer.',
    formIntro: 'Halo, saya ingin berkonsultasi. Berikut isian formulir saya:',
    fieldName: 'Nama',
    fieldPhone: 'WhatsApp',
    fieldDate: 'Tanggal acara',
    fieldDateUndecided: 'Belum ditentukan',
    fieldGuests: 'Perkiraan tamu',
    fieldVenue: 'Jenis lokasi',
    fieldPackage: 'Paket',
    fieldNotes: 'Catatan',
    source: 'Dikirim dari halaman',
    button: 'Tombol',
  },

  notFound: {
    eyebrow: 'Halaman tidak ditemukan',
    headline: 'Halaman ini tidak ada',
    description:
      'Tautannya mungkin sudah berubah atau salah ketik. Gunakan menu di atas, atau mulai dari beranda.',
    cta: 'Kembali ke beranda',
    metaTitle: `Halaman tidak ditemukan — ${NAME}`,
  },

  pages: {
    home: {
      meta: {
        title: `${NAME} — Wedding Organizer ${PLACE}`,
        description: `${NAME} adalah wedding organizer di ${PLACE}. Paket full wedding organizer, partial, dan day coordinator, dengan alur kerja yang dijelaskan langkah demi langkah. Konsultasi lewat WhatsApp.`,
      },
      hero: {
        eyebrow: `Wedding Organizer ${PLACE}`,
        lead: 'Perencanaan dan pelaksanaan acara pernikahan, dari konsultasi awal sampai hari H.',
        cta: 'Mulai konsultasi',
        ctaSecondary: 'Lihat paket',
        scrollHint: 'Gulir',
      },
      packages: {
        eyebrow: 'Paket',
        headline: 'Tiga tingkat pendampingan',
        description:
          'Pilih sesuai seberapa banyak yang sudah Anda siapkan sendiri. Setiap paket punya batas tanggung jawab yang tertulis, dan biayanya dihitung per acara.',
        cta: 'Lihat rincian paket',
      },
      gallery: {
        eyebrow: 'Galeri',
        headline: 'Dikelompokkan per jenis acara',
        description:
          'Intimate wedding, beach wedding, upacara adat, dan resepsi punya kebutuhan teknis yang berbeda. Galeri disusun mengikuti pengelompokan itu.',
        cta: 'Buka galeri',
      },
      process: {
        eyebrow: 'Cara kerja',
        headline: 'Dari obrolan pertama sampai hari H',
        description:
          'Urutannya sama untuk setiap acara. Jika ini pernikahan pertama yang Anda urus, halaman ini menjelaskan apa yang terjadi di tiap tahap.',
        cta: 'Lihat cara kerja',
      },
    },

    packages: {
      meta: {
        title: `Paket Wedding Organizer — ${NAME}`,
        description: `Paket wedding organizer di ${PLACE}: full wedding organizer, partial, dan day coordinator. Isi tiap paket dan batas tanggung jawabnya dijelaskan tanpa daftar harga, karena setiap acara dihitung terpisah.`,
      },
      header: {
        eyebrow: 'Paket layanan',
        headline: 'Full, partial, atau day coordinator',
        description:
          'Ketiganya berbeda pada titik kapan kami mulai terlibat dan sejauh mana tanggung jawab kami. Tidak ada daftar harga di halaman ini karena kebutuhan tiap acara berbeda; angkanya dibicarakan setelah gambaran acara jelas.',
        cta: 'Tanyakan paket lewat WhatsApp',
      },
      panelHint: 'Pilih paket untuk membaca rinciannya',
    },

    gallery: {
      meta: {
        title: `Galeri — ${NAME}`,
        description: `Galeri ${NAME}, wedding organizer di ${PLACE}, dikelompokkan per jenis acara: intimate wedding, beach wedding, upacara adat, dan resepsi.`,
      },
      header: {
        eyebrow: 'Galeri',
        headline: 'Galeri per jenis acara',
        description:
          'Gunakan penyaring di bawah untuk melihat satu jenis acara saja. Semua gambar di halaman ini adalah grafis yang dibuat khusus untuk situs ini, bukan dokumentasi acara.',
        cta: 'Diskusikan jenis acara Anda',
      },
      empty: 'Tidak ada materi pada kategori ini.',
      countLabel: (n: number) => `${n} materi`,
    },

    process: {
      meta: {
        title: `Cara Kerja — ${NAME}`,
        description: `Alur kerja wedding organizer di ${PLACE}, langkah demi langkah: konsultasi awal, penentuan konsep dan tanggal, pemilihan vendor, penyusunan rundown, gladi bersih, dan hari H.`,
      },
      header: {
        eyebrow: 'Cara kerja',
        headline: 'Urutan kerjanya seperti ini',
        description:
          'Enam tahap, dengan hasil yang jelas di tiap tahap. Anda selalu tahu sedang berada di titik mana dan apa yang perlu diputuskan berikutnya.',
        cta: 'Mulai dari langkah pertama',
      },
      vendors: {
        eyebrow: 'Kategori vendor',
        headline: 'Kategori yang biasanya perlu diisi',
        description:
          'Kami menyusun pilihan per kategori, bukan mengarahkan ke satu nama tertentu. Daftar rekanan tidak dipublikasikan di situs ini.',
        cta: 'Tanyakan kategori yang Anda butuhkan',
      },
    },

    contact: {
      meta: {
        title: `Kontak dan Konsultasi — ${NAME}`,
        description: `Hubungi ${NAME}, wedding organizer di ${PLACE}. Isi formulir konsultasi atau kirim pesan WhatsApp untuk membicarakan rencana acara Anda.`,
      },
      header: {
        eyebrow: 'Kontak',
        headline: 'Mulai dari percakapan',
        description:
          'Isi formulir di bawah dan isiannya akan tersusun rapi menjadi satu pesan WhatsApp. Jika lebih nyaman langsung mengetik, tombol WhatsApp juga tersedia.',
        cta: 'Kirim pesan WhatsApp',
      },
      details: {
        eyebrow: 'Keterangan',
        headline: 'Lokasi dan waktu operasional',
        description: 'Keterangan yang sudah pasti kami tampilkan apa adanya.',
        cta: 'Tanyakan lewat WhatsApp',
        cityLabel: 'Kota',
        addressLabel: 'Alamat',
        hoursLabel: 'Jam operasional',
        emailLabel: 'Email',
        whatsappLabel: 'WhatsApp',
        addressPending: 'Alamat lengkap belum dipublikasikan. Silakan tanyakan lewat WhatsApp.',
        hoursPending: 'Jam operasional belum dipublikasikan. Pesan WhatsApp dibalas pada jam kerja.',
      },
    },

    privacy: {
      meta: {
        title: `Kebijakan Privasi — ${NAME}`,
        description: `Kebijakan privasi ${NAME}: data apa yang dikumpulkan lewat formulir konsultasi, bagaimana cookie digunakan, dan bagaimana menghubungi kami soal data Anda.`,
      },
      header: {
        eyebrow: 'Legal',
        headline: 'Kebijakan Privasi',
        description: 'Penjelasan singkat tentang data yang Anda kirim lewat situs ini.',
        cta: 'Tanyakan soal data Anda',
      },
    },

    terms: {
      meta: {
        title: `Syarat dan Ketentuan — ${NAME}`,
        description: `Syarat dan ketentuan penggunaan situs ${NAME}, wedding organizer di ${PLACE}.`,
      },
      header: {
        eyebrow: 'Legal',
        headline: 'Syarat dan Ketentuan',
        description: 'Ketentuan penggunaan situs ini dan batasannya.',
        cta: 'Tanyakan hal lain',
      },
    },
  },
}

const en: typeof id = {
  htmlLang: 'en',
  localeName: 'English',
  localeShort: 'EN',

  nav: {
    home: 'Home',
    packages: 'Packages',
    gallery: 'Gallery',
    process: 'How We Work',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    menuLabel: 'Main menu',
    skipToContent: 'Skip to main content',
    languageLabel: 'Choose language',
  },

  common: {
    consult: 'Start a consultation',
    consultShort: 'Consultation',
    whatsapp: 'Chat on WhatsApp',
    viewPackages: 'View packages',
    viewGallery: 'Open the gallery',
    viewProcess: 'See how we work',
    contactUs: 'Contact us',
    readMore: 'Read more',
    showMore: 'Show more',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    scopeLabel: 'What we handle',
    boundaryLabel: 'Where our responsibility ends',
    bestForLabel: 'Suited to',
    outputLabel: 'What you end up with',
    stepLabel: 'Step',
    allCategories: 'All',
    galleryFilterLabel: 'Filter the gallery by event type',
    graphicAlt: (category: string, n: number) =>
      `Geometric graphic ${n} for the ${category} category. A placeholder illustration, not event documentation.`,
    lightboxLabel: 'Enlarged view of a gallery graphic',
    loading: 'Loading',
  },

  footer: {
    eyebrow: 'Consultation',
    headline: 'Tell us about your plans',
    description:
      'Send a short outline through the consultation form or on WhatsApp. We reply with follow-up questions so the requirements are clear first.',
    ctaForm: 'Fill in the consultation form',
    ctaWhatsapp: 'Send a WhatsApp message',
    based: `Wedding organizer in ${PLACE}`,
    rights: (year: number) => `© ${year} ${NAME}`,
    navLabel: 'Footer navigation',
    legalLabel: 'Legal links',
    builtNote: 'The graphics on this site were made for it and are not event documentation.',
  },

  cookie: {
    title: 'Cookies on this site',
    body:
      'Analytics cookies are only set if you allow them. Without your permission nothing is measured. Your language choice is stored separately because the site needs it to work.',
    accept: 'Allow',
    reject: 'Decline',
    more: 'Read the privacy policy',
    label: 'Cookie notice',
    manage: 'Cookie settings',
    statusAccepted: 'Analytics cookies: allowed',
    statusRejected: 'Analytics cookies: declined',
    change: 'Change choice',
  },

  form: {
    title: 'Consultation form',
    intro: 'Fill in what you know. Anything still undecided can be left blank or marked as undecided.',
    name: 'Name',
    namePlaceholder: 'Your name',
    phone: 'WhatsApp number',
    phonePlaceholder: 'For example: +62 812 3456 7890',
    date: 'Event date',
    dateUndecided: 'Date not decided yet',
    datePlaceholder: 'Pick a date',
    dateOpenCalendar: 'Open calendar',
    guests: 'Estimated guest count',
    guestsPlaceholder: 'Choose an estimate',
    venue: 'Area or venue type',
    venuePlaceholder: 'Choose a venue type',
    packageField: 'Package of interest',
    packagePlaceholder: 'Choose a package',
    packageUndecided: 'Not sure yet, please advise',
    notes: 'Notes',
    notesPlaceholder: 'Anything else we should know',
    optional: 'optional',
    submit: 'Send via WhatsApp',
    submitting: 'Preparing your message',
    successTitle: 'Your message is ready',
    successBody:
      'WhatsApp will open with your answers filled in. If it does not open by itself, use the link below.',
    successLink: 'Open WhatsApp',
    errorTitle: 'A few things need fixing',
    calendarLabel: 'Date picker calendar',
    monthPrevious: 'Previous month',
    monthNext: 'Next month',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    weekdaysLong: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    errors: {
      name: 'Please enter your name.',
      nameLong: 'That name is too long.',
      phone: 'Please enter a WhatsApp number we can reach you on.',
      phoneFormat: 'The number may only contain digits, spaces, a plus sign, and hyphens.',
      date: 'Pick an event date, or tick the undecided box.',
      datePast: 'The event date cannot be in the past.',
      dateFar: 'That date is very far out. Please message us directly for plans beyond five years.',
      guests: 'Choose an estimated guest count.',
      venue: 'Choose an area or venue type.',
      package: 'Choose the package you are interested in.',
      notesLong: 'The notes are too long; 1000 characters maximum.',
      generic: 'Something is missing. Please check the highlighted fields.',
    },
  },

  wa: {
    intro: 'Hello, I would like to ask about your wedding organizer services.',
    formIntro: 'Hello, I would like a consultation. Here is what I filled in:',
    fieldName: 'Name',
    fieldPhone: 'WhatsApp',
    fieldDate: 'Event date',
    fieldDateUndecided: 'Not decided yet',
    fieldGuests: 'Estimated guests',
    fieldVenue: 'Venue type',
    fieldPackage: 'Package',
    fieldNotes: 'Notes',
    source: 'Sent from page',
    button: 'Button',
  },

  notFound: {
    eyebrow: 'Page not found',
    headline: 'This page does not exist',
    description:
      'The link may have changed, or it may be a typo. Use the menu above, or start again from the home page.',
    cta: 'Back to the home page',
    metaTitle: `Page not found — ${NAME}`,
  },

  pages: {
    home: {
      meta: {
        title: `${NAME} — Wedding Organizer in ${PLACE}`,
        description: `${NAME} is a wedding organizer based in ${PLACE}. Full wedding organizer, partial, and day coordinator packages, with the working process explained step by step. Consultation over WhatsApp.`,
      },
      hero: {
        eyebrow: `Wedding Organizer in ${PLACE}`,
        lead: 'Planning and running wedding events, from the first consultation to the day itself.',
        cta: 'Start a consultation',
        ctaSecondary: 'View packages',
        scrollHint: 'Scroll',
      },
      packages: {
        eyebrow: 'Packages',
        headline: 'Three levels of support',
        description:
          'Choose based on how much you have already arranged yourself. Each package states where its responsibility ends, and the cost is worked out per event.',
        cta: 'See the package detail',
      },
      gallery: {
        eyebrow: 'Gallery',
        headline: 'Grouped by event type',
        description:
          'Intimate weddings, beach weddings, traditional ceremonies, and receptions each have different technical needs. The gallery follows that grouping.',
        cta: 'Open the gallery',
      },
      process: {
        eyebrow: 'How we work',
        headline: 'From first message to the day itself',
        description:
          'The sequence is the same for every event. If this is the first wedding you have organised, this page sets out what happens at each stage.',
        cta: 'See how we work',
      },
    },

    packages: {
      meta: {
        title: `Wedding Organizer Packages — ${NAME}`,
        description: `Wedding organizer packages in ${PLACE}: full wedding organizer, partial, and day coordinator. What each package covers and where its responsibility ends, without a price list, because every event is quoted separately.`,
      },
      header: {
        eyebrow: 'Service packages',
        headline: 'Full, partial, or day coordinator',
        description:
          'The three differ in when we get involved and how far our responsibility reaches. There is no price list here because every event is different; the numbers are discussed once the shape of the event is clear.',
        cta: 'Ask about packages on WhatsApp',
      },
      panelHint: 'Choose a package to read the detail',
    },

    gallery: {
      meta: {
        title: `Gallery — ${NAME}`,
        description: `The ${NAME} gallery, a wedding organizer in ${PLACE}, grouped by event type: intimate weddings, beach weddings, traditional ceremonies, and receptions.`,
      },
      header: {
        eyebrow: 'Gallery',
        headline: 'Gallery by event type',
        description:
          'Use the filter below to look at one event type at a time. Every image on this page is a graphic made for this site, not event documentation.',
        cta: 'Talk about your event type',
      },
      empty: 'Nothing in this category yet.',
      countLabel: (n: number) => `${n} items`,
    },

    process: {
      meta: {
        title: `How We Work — ${NAME}`,
        description: `The working process of a wedding organizer in ${PLACE}, step by step: first consultation, concept and date, choosing vendors, building the rundown, rehearsal, and the day itself.`,
      },
      header: {
        eyebrow: 'How we work',
        headline: 'The order of work',
        description:
          'Six stages, each with a clear result. You always know which stage you are in and what needs deciding next.',
        cta: 'Start at step one',
      },
      vendors: {
        eyebrow: 'Vendor categories',
        headline: 'Categories that usually need filling',
        description:
          'We put together options per category rather than pointing you at one name. Partner lists are not published on this site.',
        cta: 'Ask about the categories you need',
      },
    },

    contact: {
      meta: {
        title: `Contact and Consultation — ${NAME}`,
        description: `Get in touch with ${NAME}, a wedding organizer in ${PLACE}. Fill in the consultation form or send a WhatsApp message to talk through your plans.`,
      },
      header: {
        eyebrow: 'Contact',
        headline: 'It starts with a conversation',
        description:
          'Fill in the form below and your answers are assembled into a single WhatsApp message. If you would rather just type, the WhatsApp button is there too.',
        cta: 'Send a WhatsApp message',
      },
      details: {
        eyebrow: 'Details',
        headline: 'Location and hours',
        description: 'We publish only what is confirmed.',
        cta: 'Ask on WhatsApp',
        cityLabel: 'City',
        addressLabel: 'Address',
        hoursLabel: 'Opening hours',
        emailLabel: 'Email',
        whatsappLabel: 'WhatsApp',
        addressPending: 'The full address is not published yet. Please ask on WhatsApp.',
        hoursPending: 'Opening hours are not published yet. WhatsApp messages are answered during working hours.',
      },
    },

    privacy: {
      meta: {
        title: `Privacy Policy — ${NAME}`,
        description: `The ${NAME} privacy policy: what the consultation form collects, how cookies are used, and how to contact us about your data.`,
      },
      header: {
        eyebrow: 'Legal',
        headline: 'Privacy Policy',
        description: 'A short explanation of the data you send through this site.',
        cta: 'Ask about your data',
      },
    },

    terms: {
      meta: {
        title: `Terms of Service — ${NAME}`,
        description: `Terms of service for the ${NAME} website, a wedding organizer in ${PLACE}.`,
      },
      header: {
        eyebrow: 'Legal',
        headline: 'Terms of Service',
        description: 'The terms under which this site may be used, and its limits.',
        cta: 'Ask something else',
      },
    },
  },
}

export type Dictionary = typeof id

const dictionaries: Record<Locale, Dictionary> = { id, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export { CITY, REGION, NAME, PLACE }
