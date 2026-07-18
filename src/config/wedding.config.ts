import type { Lang } from '../i18n/translations'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  WEDDING CONFIG — the single source of truth for the whole invitation.
 * ─────────────────────────────────────────────────────────────────────────────
 *  The couple only needs to edit THIS file (and drop assets into /public).
 *
 *  Assets live in:
 *    public/images  →  referenced as "/images/xxx.jpg"
 *    public/videos  →  referenced as "/videos/xxx.mp4"
 *    public/music   →  referenced as "/music/xxx.mp3"
 *
 *  Any image path that does not exist yet will gracefully fall back to an
 *  elegant placeholder, so the site looks good even before real photos arrive.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Person {
  /** Short display name, e.g. "Thảo Nhi" */
  name: string
  /** Optional full name shown in formal spots */
  fullName?: string
  /** e.g. "Cô dâu" / "Chú rể" */
  role: string
  /** Portrait photo in /public/images */
  photo?: string
}

export interface TimelineItem {
  /** Aviation phase label, e.g. "Check-in" */
  phase: string
  /** lucide-react icon name — see FlightTimeline for the mapping */
  icon: 'ticket' | 'plane-takeoff' | 'cloud' | 'plane-landing'
  date: string
  title: string
  description: string
  image?: string
}

export interface GalleryImage {
  src: string
  alt: string
  caption?: string
  /** Tailwind classes picking which part of the photo shows when its frame
   *  has a different aspect — object-position and optionally a zoom, e.g.
   *  'object-top' or 'object-[50%_20%] scale-[1.35] origin-[50%_15%]'. */
  focus?: string
}

export interface WeddingConfig {
  /** Per-repository identity, language availability and visible name order. */
  site: {
    enabledLanguages: readonly Lang[]
    defaultLanguage: Lang
    coupleOrder: readonly ['bride' | 'groom', 'bride' | 'groom']
    /** Canonical deployed URL encoded into the scannable invitation QR. */
    publicUrl: string
  }

  /** Names & flight code used across hero, boarding pass, etc. */
  event: {
    /** Big hero title */
    tagline: string
    /** e.g. "Save the Date" */
    kicker: string
    /** Airline-style brand shown on the boarding pass header */
    airline: string
    /** Flight number suffix — final flight is `LOVE-{flightCode}` */
    flightCode: string
  }

  couple: {
    bride: Person
    groom: Person
    /** Short "&" separator hashtag, optional */
    hashtag?: string
  }

  date: {
    /** ISO date-time WITH timezone offset. Powers countdown + calendar file. */
    iso: string
    /** Human date, e.g. "20 · 12 · 2026" */
    displayDate: string
    /** Day of week / lunar note, e.g. "Chủ Nhật" */
    weekday: string
    /** Boarding time text, e.g. "16:00" */
    time: string
    /** Ceremony and reception time ranges shown in the event details. */
    ceremonyTime?: string
    banquetTime?: string
    /** How long to block on the calendar (hours) */
    durationHours: number
  }

  venue: {
    name: string
    hall?: string
    address: string
    /** Optional translated street addresses keyed by the active language. */
    addressTranslations?: Partial<Record<Lang, string>>
    /** Google Maps embed URL (…/maps/embed?...). Empty string hides the map. */
    mapEmbedUrl: string
    /** Google Maps share/place URL for the "Open in Maps" button. */
    mapLink: string
  }

  hero: {
    /** Background image (jpg/png) OR poster for the video. */
    backgroundImage: string
    /** Optional background video; leave "" to use the image only. */
    backgroundVideo: string
  }

  timeline: TimelineItem[]

  gallery: {
    images: GalleryImage[]
    /** Pre-wedding video shown in a luxury frame. Leave "" to hide it. */
    video: string
    /** Poster frame for the video. */
    videoPoster: string
  }

  boardingPass: {
    /** Static poster used on the downloadable card (never a video). */
    poster: string
    from: string
    to: string
    /** Small print at the bottom of the pass. */
    footnote: string
  }

  loveMessage: {
    heading: string
    body: string[]
    signature: string
  }

  thankYou: {
    heading: string
    message: string
  }

  guestbook: {
    /** Optional Apps Script / API endpoint that stores + returns wishes as
     *  JSON `[{ name, message, ts }]`. Empty ⇒ wishes stay on the guest's
     *  device only (still a lovely keepsake, just not shared). */
    endpoint: string
    /** Short tag identifying this wedding in the shared wishes sheet, so the
     *  two invitation sites keep their guest books separate. */
    site: string
  }

  music: {
    /** Sequential background playlist in /public/music. Empty hides controls. */
    tracks: Array<{
      src: string
      title: string
      artist: string
    }>
    initialVolume: number
  }
}

export const weddingConfig: WeddingConfig = {
  site: {
    enabledLanguages: ['en', 'tw'],
    defaultLanguage: 'en',
    coupleOrder: ['groom', 'bride'],
    publicUrl: 'https://pinlee2409.github.io/wedding-SeanChien-SuriLe/',
  },

  event: {
    tagline: 'Flight to Forever',
    kicker: 'Save the Date',
    airline: 'Forever Airlines',
    flightCode: '1227',
  },

  couple: {
    bride: {
      name: 'Suri Le',
      fullName: 'Suri Le',
      role: 'Bride',
      photo: 'images/web/anh_nu.jpg',
    },
    groom: {
      name: 'Sean Chien',
      fullName: 'Sean Chien',
      role: 'Groom',
      photo: 'images/web/anh_nam.jpg',
    },
    hashtag: '#SeanAndSuri',
  },

  date: {
    iso: '2026-12-27T10:00:00+08:00',
    displayDate: '27 · 12 · 2026',
    weekday: 'Sunday',
    time: '10:00',
    ceremonyTime: '10:00–11:30',
    banquetTime: '12:00–14:30',
    durationHours: 4.5,
  },

  venue: {
    name: '亞果遊艇城 亞果薈 Argo Yacht Club',
    address:
      'No. 585, Sec. 2, Xingang Rd., Anping Dist., Tainan City 708013, Taiwan (R.O.C.)',
    addressTranslations: {
      tw: '台南市安平區新港路二段585號1樓',
    },
    mapEmbedUrl:
      'https://www.google.com/maps?q=%E4%BA%9E%E6%9E%9C%E9%81%8A%E8%89%87%E5%9F%8E%20%E4%BA%9E%E6%9E%9C%E8%96%88%20Argo%20Yacht%20Club%20%E5%8F%B0%E5%8D%97%E5%B8%82%E5%AE%89%E5%B9%B3%E5%8D%80%E6%96%B0%E6%B8%AF%E8%B7%AF%E4%BA%8C%E6%AE%B5585%E8%99%9F1%E6%A8%93&output=embed',
    mapLink:
      'https://www.google.com/maps/search/?api=1&query=%E4%BA%9E%E6%9E%9C%E9%81%8A%E8%89%87%E5%9F%8E%20%E4%BA%9E%E6%9E%9C%E8%96%88%20Argo%20Yacht%20Club%20%E5%8F%B0%E5%8D%97%E5%B8%82%E5%AE%89%E5%B9%B3%E5%8D%80%E6%96%B0%E6%B8%AF%E8%B7%AF%E4%BA%8C%E6%AE%B5585%E8%99%9F1%E6%A8%93',
  },

  hero: {
    backgroundImage: 'images/hero.jpg',
    backgroundVideo: '',
  },

  timeline: [
    {
      phase: 'Check-in',
      icon: 'ticket',
      date: 'Mùa thu 2019',
      title: 'Lần đầu gặp gỡ',
      description:
        'Hai hành khách xa lạ tình cờ chung một chuyến bay. Một ánh nhìn, và hành trình bắt đầu.',
      image: 'images/timeline-1.jpg',
    },
    {
      phase: 'Take-off',
      icon: 'plane-takeoff',
      date: 'Xuân 2021',
      title: 'Chính thức cất cánh',
      description:
        'Sean Chien and Suri Le joined the same crew and began writing their story together.',
      image: 'images/timeline-2.jpg',
    },
    {
      phase: 'Cruising Altitude',
      icon: 'cloud',
      date: '2021 — 2026',
      title: 'Những kỷ niệm đẹp',
      description:
        'Bay qua bao vùng trời, cùng đón bình minh và hoàng hôn ở khắp mọi nơi.',
      image: 'images/timeline-3.jpg',
    },
    {
      phase: 'Landing',
      icon: 'plane-landing',
      date: '27 · 12 · 2026',
      title: 'Ngày hạ cánh',
      description:
        'Chuyến bay hạnh phúc đáp xuống bến đỗ cuối cùng — mãi mãi bên nhau.',
      image: 'images/timeline-4.jpg',
    },
  ],

  gallery: {
    images: [
      { src: 'images/web/anh_cuoi_1.jpg', alt: '' },
      // Portrait photo in the wide panorama frame: start just below the top
      // (skips the dark headroom) and zoom in so the couple fills the frame.
      {
        src: 'images/web/anh_cuoi_2.jpg',
        alt: '',
        focus: 'object-[50%_20%] translate-x-[3%] scale-[1.35] origin-[50%_15%]',
      },
      { src: 'images/web/anh_cuoi_3.jpg', alt: '' },
      { src: 'images/web/anh_cuoi_4.jpg', alt: '' },
      { src: 'images/web/anh_cuoi_5.jpg', alt: '' },
      { src: 'images/web/anh_cuoi_6.jpg', alt: '' },
      { src: 'images/web/anh_cuoi_7.jpg', alt: '' },
      { src: 'images/web/anh_cuoi_8.jpg', alt: '' },
    ],
    video: 'videos/prewedding.mp4',
    videoPoster: 'images/prewedding-poster.jpg',
  },

  boardingPass: {
    poster: 'images/web/anhcuoi_passcard.jpg',
    from: 'Single Life',
    to: 'Forever',
    footnote:
      'Please arrive in good time so we may welcome you aboard this joyful journey ♥',
  },

  loveMessage: {
    heading: 'With heartfelt gratitude',
    body: [
      'Our journey has brought us together for a lifetime.',
      'We are deeply grateful for the honour of your presence on our special day.',
    ],
    signature: 'With love and gratitude,',
  },

  thankYou: {
    heading: 'With heartfelt thanks',
    message:
      'We look forward to welcoming you as we begin this joyful journey together.',
  },

  guestbook: {
    // Google Apps Script "Loi chuc - Boarding wishes" — stores wishes in the
    // couple's "Lời chúc" sheet and returns them for every guest.
    endpoint:
      'https://script.google.com/macros/s/AKfycbxaqUXWH-XPnL8yfOCyVqLZm66DiJRJJps38RW8sBfoAP4UO4eElx6We2ne5fs6_iQB/exec',
    site: 'suri',
  },

  music: {
    tracks: [
      {
        src: 'music/beautiful-in-white.mp3',
        title: 'Beautiful In White',
        artist: 'Shane Filan',
      },
      {
        src: 'music/young-and-beautiful.mp3',
        title: 'Young and Beautiful',
        artist: 'Lana Del Rey',
      },
      {
        src: 'music/souvenirs.mp3',
        title: 'Souvenirs',
        artist: 'van',
      },
    ],
    initialVolume: 0.55,
  },
}

export default weddingConfig
