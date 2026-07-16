/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TRANSLATIONS — every guest-facing string in three languages.
 * ─────────────────────────────────────────────────────────────────────────────
 *  vi — Tiếng Việt (default) · en — English · tw — 繁體中文 (Đài Loan)
 *
 *  Coverage is total: section kickers, boarding-pass field labels, placeholder
 *  labels and palette names all switch together — no mixed-language UI.
 *  Only true proper nouns (couple names, venue name, hashtag, "Forever
 *  Airlines") stay constant. Copy is deliberately tight: one idea per line.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Lang = 'vi' | 'en' | 'tw'

export interface TimelineCopy {
  phase: string
  date: string
  title: string
  description: string
}

export interface ThemeName {
  label: string
  note: string
}

export interface Translation {
  /** Native name shown in the language switcher. */
  langName: string
  gate: {
    title: string
    subtitle: string
    placeholder: string
    submit: string
    skip: string
  }
  hero: {
    kicker: string
    aria: string
    inviteLabel: string
    inviteFallback: string
    inviteLine: string
    scroll: string
  }
  countdown: {
    days: string
    hours: string
    minutes: string
    seconds: string
    departed: string
  }
  download: {
    kicker: string
    title: string
    subtitle: string
    png: string
    pdf: string
    generating: string
    hint: string
    error: string
  }
  timeline: {
    kicker: string
    title: string
    subtitle: string
    items: TimelineCopy[]
  }
  gallery: {
    kicker: string
    title: string
    subtitle: string
    memoryLane: string
    photo: string
    captions: [string, string]
  }
  details: {
    kicker: string
    title: string
    subtitle: string
    departure: string
    boardingAt: string
    ceremony: string
    banquet: string
    venue: string
    openMaps: string
    addCalendar: string
  }
  love: {
    kicker: string
    title: string
    body: string[]
    signature: string
  }
  couple: {
    groomRole: string
    brideRole: string
  }
  guestLink: {
    title: string
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    urlLabel: string
    urlPlaceholder: string
    copy: string
    copied: string
    copyAria: string
    openTest: string
  }
  thanks: {
    tagline: string
    heading: string
    message: string
  }
  pass: {
    label: string
    weddingOf: string
    from: string
    to: string
    passenger: string
    flight: string
    boarding: string
    date: string
    venue: string
    photoLabel: string
    passengerFallback: string
    scanQr: string
    /** Localised field VALUES (the config keeps only data, not copy). */
    fromValue: string
    toValue: string
  }
  calendar: {
    /** May contain {groom} and {bride} placeholders. */
    summary: string
    description: string
  }
  meta: {
    title: string
    description: string
  }
  ui: {
    music: string
    musicOn: string
    musicOff: string
    musicNowPlaying: string
    musicVolume: string
    musicMute: string
    musicUnmute: string
    themes: string
    chooseTheme: string
    random: string
    close: string
    backToTop: string
    chooseLang: string
    viewPhoto: string
    zoomPhoto: string
    unzoomPhoto: string
    openFullInvitation: string
  }
  /** Palette names by theme id. Empty entry ⇒ fall back to the Vietnamese
   *  label defined in `config/themes.ts`. */
  themeNames: Record<string, ThemeName>
}

export const translations: Record<Lang, Translation> = {
  /* ── Tiếng Việt ──────────────────────────────────────────────────────── */
  vi: {
    langName: 'Tiếng Việt',
    gate: {
      title: 'Kính chào Quý khách',
      subtitle: 'Vui lòng nhập tên để mở thiệp mời',
      placeholder: 'Ví dụ: Gia đình bác Hoàng',
      submit: 'Mở thiệp mời',
      skip: 'Tiếp tục xem thiệp',
    },
    hero: {
      kicker: 'Lưu ngày trọng đại',
      aria: 'Trang bìa thiệp cưới',
      inviteLabel: 'Trân trọng kính mời',
      inviteFallback: 'Trân trọng kính mời Quý khách',
      inviteLine: 'Đến chung vui trong ngày trọng đại của cô dâu và chú rể.',
      scroll: 'Cuộn xuống',
    },
    countdown: {
      days: 'Ngày',
      hours: 'Giờ',
      minutes: 'Phút',
      seconds: 'Giây',
      departed: 'Chuyến bay hạnh phúc đã cất cánh ♥',
    },
    download: {
      kicker: 'Lời mời trân quý',
      title: 'Hân hạnh đón Quý khách chung vui',
      subtitle:
        'Quý khách vui lòng lưu thẻ mời để thuận tiện khi tham dự ngày trọng đại.',
      png: 'Tải PNG',
      pdf: 'Tải PDF',
      generating: 'Đang tạo tệp…',
      hint: 'Lưu giữ tấm vé hạnh phúc — một kỷ niệm đẹp từ ngày chung vui.',
      error: 'Không thể tạo tệp. Vui lòng thử lại.',
    },
    timeline: {
      kicker: 'Hành trình bay',
      title: 'Hành trình yêu thương',
      subtitle: 'Mỗi chặng bay, một dấu mốc yêu thương.',
      items: [
        { phase: 'Làm thủ tục', date: 'Mùa thu 2019', title: 'Lần đầu gặp gỡ', description: 'Hai người xa lạ chung một chuyến bay.' },
        { phase: 'Cất cánh', date: 'Xuân 2021', title: 'Chính thức cất cánh', description: 'Về chung một đội bay, chung một câu chuyện.' },
        { phase: 'Bay ổn định', date: '2021 — 2026', title: 'Những kỷ niệm đẹp', description: 'Bình minh và hoàng hôn khắp mọi nơi.' },
        { phase: 'Hạ cánh', date: '27 · 12 · 2026', title: 'Ngày hạ cánh', description: 'Bến đỗ cuối — mãi mãi bên nhau.' },
      ],
    },
    gallery: {
      kicker: 'Album ảnh',
      title: 'Khoảnh khắc yêu thương',
      subtitle: 'Những mảnh ghép đẹp nhất.',
      memoryLane: 'Dòng ký ức',
      photo: 'Ảnh',
      captions: ['Yêu thương', 'Mãi mãi'],
    },
    details: {
      kicker: 'Chi tiết chuyến bay',
      title: 'Thông tin chuyến bay',
      subtitle: 'Kính mong Quý khách có mặt đúng giờ tại cổng khởi hành.',
      departure: 'Ngày khởi hành',
      boardingAt: 'Đón khách lúc',
      ceremony: 'Lễ cưới ngoài trời',
      banquet: 'Tiệc cưới',
      venue: 'Địa điểm',
      openMaps: 'Mở Google Maps',
      addCalendar: 'Thêm vào lịch',
    },
    love: {
      kicker: 'Lời tri ân',
      title: 'Đôi lời từ cô dâu và chú rể',
      body: [
        'Có một chuyến bay đã đưa cô dâu và chú rể về bên nhau trọn đời. Xin trân trọng cảm ơn Quý khách đã dành thời gian đến chung vui — sự hiện diện của Quý khách là niềm vinh hạnh và món quà quý giá đối với hai gia đình.',
      ],
      signature: 'Với tất cả yêu thương và lòng biết ơn,',
    },
    couple: {
      groomRole: 'Chú rể',
      brideRole: 'Cô dâu',
    },
    guestLink: {
      title: 'Tạo liên kết mời riêng',
      subtitle: 'Dành cho cô dâu & chú rể',
      nameLabel: 'Tên khách mời',
      namePlaceholder: 'Ví dụ: Gia đình bác Hoàng',
      urlLabel: 'Liên kết cá nhân hoá',
      urlPlaceholder: 'Nhập tên để tạo liên kết…',
      copy: 'Chép',
      copied: 'Đã chép',
      copyAria: 'Sao chép liên kết',
      openTest: 'Mở thử liên kết',
    },
    thanks: {
      tagline: 'Trân trọng cảm ơn Quý khách',
      heading: 'Lời cảm ơn chân thành',
      message:
        'Cô dâu, chú rể và hai gia đình hân hạnh được đón tiếp Quý khách trong ngày trọng đại.',
    },
    pass: {
      label: 'Thẻ lên máy bay',
      weddingOf: 'Lễ thành hôn của',
      from: 'Từ',
      to: 'Đến',
      passenger: 'Hành khách',
      flight: 'Chuyến bay',
      boarding: 'Đón khách',
      date: 'Ngày',
      venue: 'Địa điểm',
      photoLabel: 'Ảnh cưới',
      passengerFallback: 'Quý khách',
      scanQr: 'Quét để mở thiệp',
      fromValue: 'Ga Độc Thân',
      toValue: 'Bến Đỗ Hạnh Phúc',
    },
    calendar: {
      summary: 'Lễ thành hôn của {bride} & {groom}',
      description:
        'Flight to Forever — Trân trọng kính mời Quý khách cùng chung vui trong ngày trọng đại.',
    },
    meta: {
      title: 'Sean Chien & Suri Le · Thiệp cưới',
      description:
        'Thiệp cưới của Sean Chien và Suri Le — trân trọng kính mời Quý khách cùng chung vui trong ngày trọng đại.',
    },
    ui: {
      music: 'Nhạc nền',
      musicOn: 'Bật nhạc nền',
      musicOff: 'Tắt nhạc nền',
      musicNowPlaying: 'Đang phát',
      musicVolume: 'Âm lượng',
      musicMute: 'Tắt tiếng',
      musicUnmute: 'Bật tiếng',
      themes: 'Bộ màu',
      chooseTheme: 'Chọn bộ màu',
      random: 'Ngẫu nhiên',
      close: 'Đóng',
      backToTop: 'Lên đầu trang',
      chooseLang: 'Chọn ngôn ngữ',
      viewPhoto: 'Xem ảnh',
      zoomPhoto: 'Phóng to ảnh',
      unzoomPhoto: 'Thu nhỏ ảnh',
      openFullInvitation: 'Xem trọn thiệp mời',
    },
    // Vietnamese names live in config/themes.ts — empty map falls back there.
    themeNames: {},
  },

  /* ── English ─────────────────────────────────────────────────────────── */
  en: {
    langName: 'English',
    gate: {
      title: 'Welcome aboard',
      subtitle: 'Please enter your name to open the invitation',
      placeholder: 'e.g. John & Jane',
      submit: 'Open the invitation',
      skip: 'Continue without entering a name',
    },
    hero: {
      kicker: 'Save the Date',
      aria: 'Wedding invitation cover',
      inviteLabel: 'Cordially invited',
      inviteFallback: 'You are cordially invited',
      inviteLine: 'Please join us in celebrating our wedding.',
      scroll: 'Scroll down',
    },
    countdown: {
      days: 'Days',
      hours: 'Hours',
      minutes: 'Mins',
      seconds: 'Secs',
      departed: 'The flight to happiness has departed ♥',
    },
    download: {
      kicker: 'A Heartfelt Invitation',
      title: 'We would be delighted to celebrate with you',
      subtitle: 'Please save your boarding pass for our wedding day.',
      png: 'Download PNG',
      pdf: 'Download PDF',
      generating: 'Generating…',
      hint: 'Keep this ticket to happiness — a lovely memory of our celebration.',
      error: 'Could not create the file. Please try again.',
    },
    timeline: {
      kicker: 'Flight Journey',
      title: 'Our journey',
      subtitle: 'Every leg of the flight, a milestone of love.',
      items: [
        { phase: 'Check-in', date: 'Autumn 2019', title: 'First encounter', description: 'Two strangers on the same flight.' },
        { phase: 'Take-off', date: 'Spring 2021', title: 'Officially airborne', description: 'One crew, one story.' },
        { phase: 'Cruising Altitude', date: '2021 — 2026', title: 'Beautiful memories', description: 'Sunrises and sunsets everywhere.' },
        { phase: 'Landing', date: '27 · 12 · 2026', title: 'Landing day', description: 'Our final stop — together, forever.' },
      ],
    },
    gallery: {
      kicker: 'Gallery',
      title: 'Moments of love',
      subtitle: 'The best pieces of our journey.',
      memoryLane: 'Memory lane',
      photo: 'Photo',
      captions: ['Love', 'Forever'],
    },
    details: {
      kicker: 'Flight Details',
      title: 'Flight details',
      subtitle: 'We look forward to welcoming you at the gate.',
      departure: 'Departure date',
      boardingAt: 'Guests welcome from',
      ceremony: 'Outdoor marriage ceremony',
      banquet: 'Wedding banquet',
      venue: 'Venue',
      openMaps: 'Open Google Maps',
      addCalendar: 'Add to calendar',
    },
    love: {
      kicker: 'A Note from the Couple',
      title: 'With heartfelt gratitude',
      body: [
        'Our journey has brought us together for a lifetime. We are deeply grateful for the honour of your presence as we celebrate this special day.',
      ],
      signature: 'With love and gratitude,',
    },
    couple: {
      groomRole: 'Groom',
      brideRole: 'Bride',
    },
    guestLink: {
      title: 'Create a personal invite link',
      subtitle: 'For the bride & groom',
      nameLabel: 'Guest name',
      namePlaceholder: 'e.g. The Hoang family',
      urlLabel: 'Personalised link',
      urlPlaceholder: 'Type a name to create a link…',
      copy: 'Copy',
      copied: 'Copied',
      copyAria: 'Copy the link',
      openTest: 'Open the link',
    },
    thanks: {
      tagline: 'With sincere appreciation',
      heading: 'With heartfelt thanks',
      message:
        'We look forward to welcoming you as we begin this joyful journey together.',
    },
    pass: {
      label: 'Boarding Pass',
      weddingOf: 'The Wedding Of',
      from: 'From',
      to: 'To',
      passenger: 'Passenger',
      flight: 'Flight',
      boarding: 'Boarding',
      date: 'Date',
      venue: 'Venue',
      photoLabel: 'Wedding photo',
      passengerFallback: 'Honoured Guest',
      scanQr: 'Scan to open invite',
      fromValue: 'Single Terminal',
      toValue: 'Happy Destination',
    },
    calendar: {
      summary: 'Wedding of {groom} & {bride}',
      description:
        'Flight to Forever — please join us in celebrating this special day.',
    },
    meta: {
      title: 'Sean Chien & Suri Le · Wedding Invitation',
      description:
        'Sean Chien and Suri Le request the pleasure of your company as they celebrate their wedding.',
    },
    ui: {
      music: 'Music',
      musicOn: 'Play music',
      musicOff: 'Pause music',
      musicNowPlaying: 'Now playing',
      musicVolume: 'Volume',
      musicMute: 'Mute',
      musicUnmute: 'Unmute',
      themes: 'Palette',
      chooseTheme: 'Choose a palette',
      random: 'Random',
      close: 'Close',
      backToTop: 'Back to top',
      chooseLang: 'Choose language',
      viewPhoto: 'View photo',
      zoomPhoto: 'Zoom photo',
      unzoomPhoto: 'Zoom out',
      openFullInvitation: 'View full invitation',
    },
    themeNames: {
      'classic-navy': { label: 'Navy & Champagne', note: 'The classic wedding duo' },
      'rose-blush': { label: 'Rose Blush', note: 'Sweet & romantic' },
      'emerald-gold': { label: 'Emerald & Gold', note: 'Rich & regal' },
      'burgundy-wine': { label: 'Burgundy Wine', note: 'Warm & passionate' },
      'dusty-blue': { label: 'Dusty Blue', note: 'Soft & modern' },
      terracotta: { label: 'Terracotta', note: 'Warm as sunset' },
      lavender: { label: 'Lavender', note: 'Dreamy & gentle' },
      'midnight-gold': { label: 'Midnight & Gold', note: 'Minimal & refined' },
      'blush-champagne': { label: 'Blush & Champagne', note: 'Pure romance' },
      sakura: { label: 'Cherry Blossom', note: 'Soft as spring' },
      'peach-coral': { label: 'Peach & Coral', note: 'Sweet & vivid' },
      'sage-ivory': { label: 'Sage Green', note: 'Naturally elegant' },
      'sunset-glow': { label: 'Sunset Glow', note: 'Warm & dreamy' },
      'ocean-pearl': { label: 'Ocean Pearl', note: 'Clear & serene' },
      'plum-rose': { label: 'Ripe Plum', note: 'Alluring & luxe' },
      'mocha-cream': { label: 'Mocha Cream', note: 'Cozy & rustic' },
      'golden-hour': { label: 'Golden Hour', note: 'Glowing dusk' },
      'desert-rose': { label: 'Desert Rose', note: 'Subtle & refined' },
      'midnight-galaxy': { label: 'Midnight Galaxy', note: 'Mystic & glamorous' },
      'arctic-frost': { label: 'Arctic Frost', note: 'Crisp & pure' },
      'botanical-peony': { label: 'Peony Garden', note: 'Fresh & radiant' },
      'silk-pearl': { label: 'Silk & Pearl', note: 'Minimal & pristine' },
      'rose-quartz': { label: 'Rose Quartz', note: 'Tender & true' },
      moonlight: { label: 'Moonlight', note: 'Poetry of the night' },
      'lotus-pink': { label: 'Pink Lotus', note: 'Serene & graceful' },
      'orchid-mist': { label: 'Orchid Mist', note: 'Elegant & dreamy' },
      'autumn-hanoi': { label: 'Hanoi Autumn', note: 'Amber leaves, honey sun' },
      'royal-sapphire': { label: 'Royal Sapphire', note: 'Deep blue & platinum' },
      'velvet-noir': { label: 'Velvet Noir', note: 'Black velvet & blush' },
      'imperial-jade': { label: 'Imperial Jade', note: 'Deep jade & antique gold' },
      'antique-brass': { label: 'Antique Brass', note: 'Olive & burnished brass' },
      'platinum-blush': { label: 'Platinum Blush', note: 'Nude & cool shimmer' },
      'black-orchid': { label: 'Black Orchid', note: 'Mysterious & seductive' },
      'first-love': { label: 'First Love', note: 'Pure & tender' },
    },
  },

  /* ── 繁體中文 (Đài Loan) ─────────────────────────────────────────────── */
  tw: {
    langName: '繁體中文',
    gate: {
      title: '歡迎蒞臨',
      subtitle: '敬請輸入您的姓名，以開啟喜帖',
      placeholder: '例：陳先生與林女士',
      submit: '開啟喜帖',
      skip: '略過姓名，直接瀏覽喜帖',
    },
    hero: {
      kicker: '敬請惠存佳期',
      aria: '喜帖封面',
      inviteLabel: '誠摯敬邀',
      inviteFallback: '誠摯敬邀您蒞臨',
      inviteLine: '敬請您蒞臨，共同見證我們的幸福時刻。',
      scroll: '向下滑動',
    },
    countdown: {
      days: '天',
      hours: '時',
      minutes: '分',
      seconds: '秒',
      departed: '幸福航班已起飛 ♥',
    },
    download: {
      kicker: '誠摯邀請',
      title: '誠盼您蒞臨，共享喜悅',
      subtitle: '敬請惠存登機證，以備婚禮當日使用。',
      png: '下載 PNG',
      pdf: '下載 PDF',
      generating: '正在產生檔案…',
      hint: '珍藏這張幸福之票——留下共度喜日的美好回憶。',
      error: '無法產生檔案，請再試一次。',
    },
    timeline: {
      kicker: '飛行旅程',
      title: '我們的旅程',
      subtitle: '每一段航程，都是愛的里程碑。',
      items: [
        { phase: '報到', date: '2019 秋', title: '初次相遇', description: '兩位陌生旅客，同一班機。' },
        { phase: '起飛', date: '2021 春', title: '正式起飛', description: '同一機組，同一個故事。' },
        { phase: '巡航', date: '2021 — 2026', title: '美好回憶', description: '世界各地的日出與日落。' },
        { phase: '降落', date: '2026.12.27', title: '降落之日', description: '最後的停機坪——永遠相伴。' },
      ],
    },
    gallery: {
      kicker: '相簿',
      title: '甜蜜時刻',
      subtitle: '旅程中最美的風景。',
      memoryLane: '回憶長廊',
      photo: '照片',
      captions: ['甜蜜', '永恆'],
    },
    details: {
      kicker: '搭乘資訊',
      title: '航班資訊',
      subtitle: '敬候您於良辰蒞臨，共襄盛舉。',
      departure: '啟程日期',
      boardingAt: '迎賓時間',
      ceremony: '戶外證婚儀式',
      banquet: '婚宴',
      venue: '地點',
      openMaps: '開啟 Google 地圖',
      addCalendar: '加入行事曆',
    },
    love: {
      kicker: '新人的話',
      title: '致貴賓的一席話',
      body: [
        '一段旅程，讓我們相知相伴，攜手走向一生。承蒙您撥冗蒞臨，與我們共同見證這份喜悅；您的祝福與陪伴，是我們最珍貴的禮物。',
      ],
      signature: '謹致誠摯謝意，',
    },
    couple: {
      groomRole: '新郎',
      brideRole: '新娘',
    },
    guestLink: {
      title: '建立專屬邀請連結',
      subtitle: '新人專用',
      nameLabel: '賓客姓名',
      namePlaceholder: '例：王家闔府',
      urlLabel: '專屬連結',
      urlPlaceholder: '輸入姓名以產生連結…',
      copy: '複製',
      copied: '已複製',
      copyAria: '複製連結',
      openTest: '開啟連結測試',
    },
    thanks: {
      tagline: '誠摯感謝您的蒞臨',
      heading: '衷心感謝',
      message: '敬候您蒞臨，共同見證我們啟程幸福的新篇章。',
    },
    pass: {
      label: '登機證',
      weddingOf: '新婚誌喜',
      from: '出發',
      to: '抵達',
      passenger: '乘客',
      flight: '航班',
      boarding: '登機時間',
      date: '日期',
      venue: '地點',
      photoLabel: '婚紗照',
      passengerFallback: '貴賓',
      scanQr: '掃描開啟喜帖',
      fromValue: '單身',
      toValue: '永遠',
    },
    calendar: {
      summary: '{groom} & {bride} 婚禮',
      description:
        'Flight to Forever——誠摯敬邀您蒞臨，共同見證我們的幸福時刻。',
    },
    meta: {
      title: 'Sean Chien & Suri Le · 婚禮喜帖',
      description:
        'Sean Chien 與 Suri Le 誠摯敬邀您蒞臨婚禮，共同見證幸福時刻。',
    },
    ui: {
      music: '背景音樂',
      musicOn: '播放音樂',
      musicOff: '暫停音樂',
      musicNowPlaying: '正在播放',
      musicVolume: '音量',
      musicMute: '靜音',
      musicUnmute: '取消靜音',
      themes: '色彩主題',
      chooseTheme: '選擇色彩主題',
      random: '隨機',
      close: '關閉',
      backToTop: '回到頂部',
      chooseLang: '選擇語言',
      viewPhoto: '查看照片',
      zoomPhoto: '放大照片',
      unzoomPhoto: '縮小照片',
      openFullInvitation: '查看完整喜帖',
    },
    themeNames: {
      'classic-navy': { label: '海軍藍與香檳', note: '經典婚禮配色' },
      'rose-blush': { label: '玫瑰粉', note: '甜美浪漫' },
      'emerald-gold': { label: '祖母綠與金', note: '華麗尊貴' },
      'burgundy-wine': { label: '勃根地酒紅', note: '溫暖濃烈' },
      'dusty-blue': { label: '霧霾藍', note: '柔和現代' },
      terracotta: { label: '陶土橘', note: '如夕陽般溫暖' },
      lavender: { label: '薰衣草紫', note: '夢幻溫柔' },
      'midnight-gold': { label: '午夜金', note: '極簡高級' },
      'blush-champagne': { label: '粉與香檳', note: '純淨浪漫' },
      sakura: { label: '櫻花', note: '溫柔如春' },
      'peach-coral': { label: '蜜桃珊瑚', note: '甜美明亮' },
      'sage-ivory': { label: '鼠尾草綠', note: '自然優雅' },
      'sunset-glow': { label: '夕陽餘暉', note: '溫暖夢幻' },
      'ocean-pearl': { label: '海洋珍珠', note: '清澈寧靜' },
      'plum-rose': { label: '熟梅紫紅', note: '迷人奢華' },
      'mocha-cream': { label: '摩卡奶油', note: '溫潤質樸' },
      'golden-hour': { label: '黃金時刻', note: '日落前的燦爛' },
      'desert-rose': { label: '沙漠玫瑰', note: '細膩雅緻' },
      'midnight-galaxy': { label: '午夜星河', note: '神秘華麗' },
      'arctic-frost': { label: '極地霜雪', note: '清透純淨' },
      'botanical-peony': { label: '牡丹花園', note: '清新明媚' },
      'silk-pearl': { label: '絲綢珍珠', note: '極簡純淨' },
      'rose-quartz': { label: '粉晶', note: '溫柔堅貞' },
      moonlight: { label: '月光', note: '如詩夜色' },
      'lotus-pink': { label: '粉蓮', note: '寧靜優雅' },
      'orchid-mist': { label: '蘭花紫霧', note: '高雅夢幻' },
      'autumn-hanoi': { label: '河內之秋', note: '秋葉與蜜陽' },
      'royal-sapphire': { label: '皇家藍寶石', note: '深藍與白金' },
      'velvet-noir': { label: '黑絲絨', note: '黑絲絨與香檳粉' },
      'imperial-jade': { label: '帝王翡翠', note: '深翠與古金' },
      'antique-brass': { label: '古銅', note: '橄欖與黃銅' },
      'platinum-blush': { label: '白金粉', note: '裸色與冷光' },
      'black-orchid': { label: '黑蘭花', note: '神秘魅惑' },
      'first-love': { label: '初戀', note: '清澈羞澀' },
    },
  },
}

/** BCP-47 locale per language — used for Intl date formatting. */
export const LOCALES: Record<Lang, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  tw: 'zh-TW',
}

/** Localised long weekday for the wedding date, e.g. "Chủ Nhật" / "Sunday" / "星期日". */
export function formatWeekday(iso: string, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'long' }).format(
      new Date(iso),
    )
  } catch {
    return ''
  }
}

const STORAGE_KEY = 'wedding-lang'

function normaliseBrowserLanguages(): string[] {
  if (typeof navigator === 'undefined') return []

  const raw = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ]

  return raw
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase())
}

function getBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}

export function detectPreferredLang(): Lang {
  const languages = normaliseBrowserLanguages()

  if (languages.some((value) => value === 'vi' || value.startsWith('vi-'))) {
    return 'vi'
  }

  if (
    languages.some(
      (value) =>
        value === 'zh-tw' ||
        value === 'zh-hant' ||
        value.startsWith('zh-hant') ||
        value.includes('hant') ||
        value.includes('-tw'),
    )
  ) {
    return 'tw'
  }

  if (languages.some((value) => value === 'en' || value.startsWith('en-'))) {
    return 'en'
  }

  if (languages.some((value) => value.startsWith('zh'))) {
    return 'tw'
  }

  const timeZone = getBrowserTimeZone()
  if (timeZone === 'Asia/Taipei') return 'tw'
  if (timeZone === 'Asia/Ho_Chi_Minh' || timeZone === 'Asia/Saigon') {
    return 'vi'
  }

  return 'vi'
}

export function getSavedLang(
  enabledLanguages: readonly Lang[],
  defaultLanguage: Lang,
): Lang {
  if (typeof window === 'undefined') return defaultLanguage

  // A QR link must reproduce the language in which that invitation was made,
  // even on a phone that has never opened the site before.
  const requested = new URLSearchParams(window.location.search).get('lang')
  if (
    (requested === 'vi' || requested === 'en' || requested === 'tw') &&
    enabledLanguages.includes(requested)
  ) {
    return requested
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (
      (saved === 'vi' || saved === 'en' || saved === 'tw') &&
      enabledLanguages.includes(saved)
    ) {
      return saved
    }
  } catch {
    /* ignore storage errors */
  }
  const preferred = detectPreferredLang()
  return enabledLanguages.includes(preferred) ? preferred : defaultLanguage
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* ignore storage errors */
  }
}
