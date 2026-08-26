import { client } from '@/config/client.config'
import type { Locale } from '@/i18n/routes'

/* ============================================================================
 * LEGAL PAGE BODIES
 *
 * Plain, standard wording. No invented figures, no retention periods we have
 * not agreed, no company registration details, no guarantees. If the client
 * confirms any of those later, add them here and nowhere else.
 * ==========================================================================*/

export type LegalSection = { heading: string; paragraphs: string[]; list?: string[] }

const NAME = client.name
const PLACE = `${client.city}, ${client.region}`

const privacyId: LegalSection[] = [
  {
    heading: 'Ringkasan',
    paragraphs: [
      `Halaman ini menjelaskan data apa yang ${NAME} terima melalui situs ini dan apa yang dilakukan terhadap data tersebut. Situs ini tidak menjual data kepada pihak lain.`,
    ],
  },
  {
    heading: 'Data yang Anda kirimkan sendiri',
    paragraphs: [
      'Formulir konsultasi menanyakan hal-hal berikut. Anda yang memutuskan apakah akan mengisinya.',
    ],
    list: [
      'Nama',
      'Nomor WhatsApp',
      'Tanggal acara, atau keterangan bahwa tanggal belum ditentukan',
      'Perkiraan jumlah tamu',
      'Area atau jenis lokasi acara',
      'Paket yang diminati',
      'Catatan tambahan yang Anda tulis sendiri',
    ],
  },
  {
    heading: 'Bagaimana isian formulir dikirim',
    paragraphs: [
      'Isian formulir diperiksa kelengkapannya di server situs ini, lalu disusun menjadi satu pesan WhatsApp yang terbuka di perangkat Anda. Pesan tersebut baru terkirim ketika Anda menekan kirim di WhatsApp.',
      'Karena pengiriman terjadi melalui WhatsApp, isi pesan Anda juga tunduk pada kebijakan privasi penyedia layanan WhatsApp. Kami tidak menguasai layanan tersebut.',
    ],
  },
  {
    heading: 'Penggunaan data',
    paragraphs: [
      'Data yang Anda kirim digunakan untuk menjawab pertanyaan Anda dan membicarakan kebutuhan acara. Data tidak digunakan untuk keperluan lain tanpa persetujuan Anda.',
    ],
  },
  {
    heading: 'Cookie',
    paragraphs: [
      'Situs ini menyimpan pilihan bahasa Anda agar halaman berikutnya tampil dalam bahasa yang sama. Penyimpanan ini diperlukan agar situs berfungsi sebagaimana mestinya.',
      'Cookie pengukuran atau analitik hanya dipasang setelah Anda menekan tombol izinkan pada pemberitahuan cookie. Jika Anda menolak, tidak ada pengukuran yang dijalankan, dan pilihan Anda ikut disimpan agar pemberitahuan tidak muncul berulang. Anda dapat mengubah pilihan itu kapan saja melalui tautan pengaturan cookie di bagian bawah halaman.',
    ],
  },
  {
    heading: 'Penyimpanan dan penghapusan',
    paragraphs: [
      'Percakapan konsultasi disimpan selama masih dibutuhkan untuk menindaklanjuti permintaan Anda. Anda dapat meminta agar percakapan dan data Anda dihapus dengan menghubungi kami melalui WhatsApp.',
    ],
  },
  {
    heading: 'Hak Anda',
    paragraphs: [
      'Anda berhak menanyakan data apa yang kami simpan tentang Anda, meminta perbaikan bila ada yang keliru, dan meminta penghapusan. Permintaan tersebut dapat disampaikan melalui kontak yang tercantum di situs ini.',
    ],
  },
  {
    heading: 'Perubahan halaman ini',
    paragraphs: [
      'Isi halaman ini dapat berubah bila cara kerja situs berubah. Versi yang berlaku adalah versi yang sedang tampil di halaman ini.',
    ],
  },
  {
    heading: 'Menghubungi kami',
    paragraphs: [
      `Pertanyaan mengenai halaman ini dapat disampaikan kepada ${NAME} melalui WhatsApp yang tercantum di situs ini.`,
    ],
  },
]

const privacyEn: LegalSection[] = [
  {
    heading: 'Summary',
    paragraphs: [
      `This page explains what data ${NAME} receives through this website and what happens to it. This site does not sell data to anyone.`,
    ],
  },
  {
    heading: 'Data you send us yourself',
    paragraphs: ['The consultation form asks for the following. It is your decision whether to fill it in.'],
    list: [
      'Name',
      'WhatsApp number',
      'Event date, or a note that the date is undecided',
      'Estimated guest count',
      'Area or venue type',
      'Package of interest',
      'Any notes you write yourself',
    ],
  },
  {
    heading: 'How the form is sent',
    paragraphs: [
      'Form entries are checked for completeness on this site server, then assembled into a single WhatsApp message that opens on your device. The message is only sent once you press send inside WhatsApp.',
      'Because delivery happens through WhatsApp, the content of your message is also subject to the privacy policy of the WhatsApp service provider. We do not control that service.',
    ],
  },
  {
    heading: 'How the data is used',
    paragraphs: [
      'What you send is used to answer your question and to discuss the requirements of your event. It is not used for anything else without your agreement.',
    ],
  },
  {
    heading: 'Cookies',
    paragraphs: [
      'This site stores your language choice so the next page appears in the same language. That storage is necessary for the site to work as intended.',
      'Measurement or analytics cookies are only set after you press allow on the cookie notice. If you decline, no measurement runs, and your choice is stored so the notice does not keep reappearing. You can change that choice at any time through the cookie settings link at the bottom of the page.',
    ],
  },
  {
    heading: 'Storage and deletion',
    paragraphs: [
      'Consultation conversations are kept for as long as they are needed to follow up on your enquiry. You can ask for your conversation and your data to be deleted by contacting us on WhatsApp.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      'You may ask what data we hold about you, ask for corrections where something is wrong, and ask for deletion. Send such requests through the contact details shown on this site.',
    ],
  },
  {
    heading: 'Changes to this page',
    paragraphs: [
      'The content of this page may change if the way the site works changes. The version that applies is the one currently shown on this page.',
    ],
  },
  {
    heading: 'Contacting us',
    paragraphs: [
      `Questions about this page can be sent to ${NAME} on the WhatsApp number shown on this site.`,
    ],
  },
]

const termsId: LegalSection[] = [
  {
    heading: 'Lingkup',
    paragraphs: [
      `Ketentuan ini berlaku untuk penggunaan situs ${NAME}. Dengan menggunakan situs ini, Anda dianggap membaca dan menerima ketentuan di halaman ini.`,
    ],
  },
  {
    heading: 'Sifat informasi di situs ini',
    paragraphs: [
      'Keterangan mengenai paket layanan di situs ini bersifat gambaran umum. Cakupan pekerjaan, jadwal, dan biaya untuk acara Anda ditetapkan dalam kesepakatan tertulis yang terpisah, bukan oleh halaman ini.',
      'Situs ini tidak mencantumkan harga karena kebutuhan tiap acara berbeda. Tidak ada penawaran yang mengikat yang timbul dari halaman mana pun di situs ini.',
    ],
  },
  {
    heading: 'Materi visual',
    paragraphs: [
      'Seluruh gambar di situs ini adalah grafis geometris yang dibuat khusus untuk situs ini. Gambar tersebut bukan dokumentasi acara, bukan foto klien, dan tidak menggambarkan lokasi tertentu.',
    ],
  },
  {
    heading: 'Yang tidak dijanjikan',
    paragraphs: [
      'Situs ini tidak menjanjikan ketersediaan tanggal tertentu, ketersediaan vendor atau lokasi tertentu, kondisi cuaca, maupun hasil acara. Hal-hal tersebut bergantung pada pihak ketiga dan keadaan di lapangan.',
      'Layanan yang diberikan oleh vendor pihak ketiga berada di bawah kesepakatan masing-masing vendor dengan klien.',
    ],
  },
  {
    heading: 'Penggunaan formulir dan kontak',
    paragraphs: [
      'Formulir konsultasi disediakan untuk permintaan yang sungguh-sungguh. Mohon tidak mengirimkan data pihak lain tanpa izin mereka, dan tidak menggunakan formulir untuk mengirim materi promosi atau berulang secara otomatis.',
    ],
  },
  {
    heading: 'Hak atas isi situs',
    paragraphs: [
      `Teks, grafis, dan susunan halaman pada situs ini merupakan milik ${NAME} atau pihak yang memberi lisensi kepadanya. Penggunaan ulang di luar keperluan pribadi memerlukan izin tertulis.`,
    ],
  },
  {
    heading: 'Tautan ke layanan lain',
    paragraphs: [
      'Situs ini menautkan ke WhatsApp. Layanan tersebut dikelola pihak lain dan memiliki ketentuannya sendiri, yang berada di luar kendali kami.',
    ],
  },
  {
    heading: 'Ketersediaan situs',
    paragraphs: [
      'Situs dapat sewaktu-waktu tidak dapat diakses karena pemeliharaan atau gangguan teknis. Kami berupaya wajar untuk memulihkannya, namun tidak menjamin situs tersedia tanpa henti.',
    ],
  },
  {
    heading: 'Perubahan ketentuan',
    paragraphs: [
      'Ketentuan ini dapat diperbarui. Versi yang berlaku adalah versi yang sedang tampil di halaman ini.',
    ],
  },
  {
    heading: 'Hukum yang berlaku',
    paragraphs: [
      `Ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia. Situs dioperasikan dari ${PLACE}.`,
    ],
  },
]

const termsEn: LegalSection[] = [
  {
    heading: 'Scope',
    paragraphs: [
      `These terms apply to the use of the ${NAME} website. By using this site you are taken to have read and accepted what is on this page.`,
    ],
  },
  {
    heading: 'The nature of the information here',
    paragraphs: [
      'The package descriptions on this site are a general outline. The scope of work, schedule, and cost for your event are set out in a separate written agreement, not by this page.',
      'This site does not list prices, because every event has different requirements. No binding offer arises from any page on this site.',
    ],
  },
  {
    heading: 'Visual material',
    paragraphs: [
      'Every image on this site is a geometric graphic made specifically for it. The images are not event documentation, not client photographs, and do not depict any particular location.',
    ],
  },
  {
    heading: 'What is not promised',
    paragraphs: [
      'This site does not promise the availability of any particular date, the availability of any particular vendor or venue, weather conditions, or the outcome of an event. Those depend on third parties and on conditions on the day.',
      'Services delivered by third-party vendors sit under each vendor own agreement with the client.',
    ],
  },
  {
    heading: 'Using the form and contact channels',
    paragraphs: [
      'The consultation form is provided for genuine enquiries. Please do not submit other people data without their permission, and do not use the form to send promotional or automated repeat material.',
    ],
  },
  {
    heading: 'Rights in the site content',
    paragraphs: [
      `The text, graphics, and page arrangement on this site belong to ${NAME} or to those who license them to it. Reuse beyond personal purposes needs written permission.`,
    ],
  },
  {
    heading: 'Links to other services',
    paragraphs: [
      'This site links to WhatsApp. That service is run by another party and has its own terms, which are outside our control.',
    ],
  },
  {
    heading: 'Site availability',
    paragraphs: [
      'The site may be unavailable from time to time because of maintenance or technical faults. We make reasonable efforts to restore it, but do not guarantee uninterrupted availability.',
    ],
  },
  {
    heading: 'Changes to these terms',
    paragraphs: [
      'These terms may be updated. The version that applies is the one currently shown on this page.',
    ],
  },
  {
    heading: 'Governing law',
    paragraphs: [
      `These terms are governed by the law of the Republic of Indonesia. The site is operated from ${PLACE}.`,
    ],
  },
]

export function getLegal(locale: Locale, page: 'privacy' | 'terms'): LegalSection[] {
  if (page === 'privacy') return locale === 'id' ? privacyId : privacyEn
  return locale === 'id' ? termsId : termsEn
}
