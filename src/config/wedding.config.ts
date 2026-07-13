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
    /** How long to block on the calendar (hours) */
    durationHours: number
  }

  venue: {
    name: string
    hall?: string
    address: string
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

  music: {
    /** Background track in /public/music. Leave "" to hide the toggle. */
    src: string
    title: string
  }
}

export const weddingConfig: WeddingConfig = {
  site: {
    enabledLanguages: ['en', 'tw'],
    defaultLanguage: 'en',
    coupleOrder: ['groom', 'bride'],
  },

  event: {
    tagline: 'Flight to Forever',
    kicker: 'Save the Date',
    airline: 'Forever Airlines',
    flightCode: '1220',
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
    iso: '2026-12-20T16:00:00+07:00',
    displayDate: '20 · 12 · 2026',
    weekday: 'Chủ Nhật',
    time: '16:00',
    durationHours: 4,
  },

  venue: {
    name: 'Trung tâm Hội nghị & Tiệc cưới Diamond Palace',
    hall: 'Sảnh Sapphire · Tầng 3',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    // Replace with your own Google Maps "Embed a map" iframe src.
    mapEmbedUrl:
      'https://www.google.com/maps?q=Ho+Chi+Minh+City+Opera+House&output=embed',
    mapLink: 'https://maps.google.com/?q=Ho+Chi+Minh+City+Opera+House',
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
        'Chúng mình về chung một đội bay, cùng nhau viết nên câu chuyện của riêng mình.',
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
      date: '20 · 12 · 2026',
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
    footnote: 'Vui lòng có mặt đúng giờ để không lỡ chuyến bay hạnh phúc ♥',
  },

  loveMessage: {
    heading: 'Đôi lời từ chúng mình',
    body: [
      'Có những chuyến bay đưa ta đến những vùng đất mới, và có một chuyến bay đưa hai con người đến trọn đời bên nhau.',
      'Cảm ơn bạn đã là một phần trong hành trình của chúng mình. Sự hiện diện của bạn chính là món quà quý giá nhất trong ngày trọng đại này.',
    ],
    signature: 'Với tất cả yêu thương,',
  },

  thankYou: {
    heading: 'Cảm ơn bạn',
    message:
      'Hẹn gặp bạn tại cổng khởi hành. Cùng nâng ly và bay đến hạnh phúc!',
  },

  music: {
    src: 'music/wedding.mp3',
    title: 'Nhạc nền',
  },
}

export default weddingConfig
