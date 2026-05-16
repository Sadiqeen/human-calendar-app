export type Season = "Winter" | "Spring" | "Summer" | "Autumn"

export interface MonthData {
  number: number
  short: string
  full: string
  thai: string
  thaiPronunciation: string
  season: Season
  seasonIcon: "Snowflake" | "Flower2" | "Sun" | "Leaf"
  memoryTrick: string
}

export const MONTHS: MonthData[] = [
  {
    number: 1,
    short: "Jan",
    full: "January",
    thai: "มกราคม",
    thaiPronunciation: "má-gà-raa-kom",
    season: "Winter",
    seasonIcon: "Snowflake",
    memoryTrick: "Jan starts the year fresh",
  },
  {
    number: 2,
    short: "Feb",
    full: "February",
    thai: "กุมภาพันธ์",
    thaiPronunciation: "gum-paa-pan",
    season: "Winter",
    seasonIcon: "Snowflake",
    memoryTrick: "Feb = February = short month",
  },
  {
    number: 3,
    short: "Mar",
    full: "March",
    thai: "มีนาคม",
    thaiPronunciation: "mee-naa-kom",
    season: "Spring",
    seasonIcon: "Flower2",
    memoryTrick: "March forward into spring",
  },
  {
    number: 4,
    short: "Apr",
    full: "April",
    thai: "เมษายน",
    thaiPronunciation: "may-sǎa-yon",
    season: "Spring",
    seasonIcon: "Flower2",
    memoryTrick: "April showers bring May flowers",
  },
  {
    number: 5,
    short: "May",
    full: "May",
    thai: "พฤษภาคม",
    thaiPronunciation: "prʉ́t-sà-paa-kom",
    season: "Spring",
    seasonIcon: "Flower2",
    memoryTrick: "May flowers bloom",
  },
  {
    number: 6,
    short: "Jun",
    full: "June",
    thai: "มิถุนายน",
    thaiPronunciation: "mí-tù-naa-yon",
    season: "Summer",
    seasonIcon: "Sun",
    memoryTrick: "June — school's out",
  },
  {
    number: 7,
    short: "Jul",
    full: "July",
    thai: "กรกฎาคม",
    thaiPronunciation: "gà-rák-gà-daa-kom",
    season: "Summer",
    seasonIcon: "Sun",
    memoryTrick: "July = hot summer peak",
  },
  {
    number: 8,
    short: "Aug",
    full: "August",
    thai: "สิงหาคม",
    thaiPronunciation: "sǐng-hǎa-kom",
    season: "Summer",
    seasonIcon: "Sun",
    memoryTrick: "August = lion month (สิงห์ = lion)",
  },
  {
    number: 9,
    short: "Sep",
    full: "September",
    thai: "กันยายน",
    thaiPronunciation: "gan-yaa-yon",
    season: "Autumn",
    seasonIcon: "Leaf",
    memoryTrick: "Sep-tember, 7th month in old Rome",
  },
  {
    number: 10,
    short: "Oct",
    full: "October",
    thai: "ตุลาคม",
    thaiPronunciation: "dtù-laa-kom",
    season: "Autumn",
    seasonIcon: "Leaf",
    memoryTrick: "October = scale (ตุลา = scales)",
  },
  {
    number: 11,
    short: "Nov",
    full: "November",
    thai: "พฤศจิกายน",
    thaiPronunciation: "prʉ́t-sà-jì-gaa-yon",
    season: "Autumn",
    seasonIcon: "Leaf",
    memoryTrick: "November = scorpion (พิจิก = scorpio)",
  },
  {
    number: 12,
    short: "Dec",
    full: "December",
    thai: "ธันวาคม",
    thaiPronunciation: "tan-waa-kom",
    season: "Winter",
    seasonIcon: "Snowflake",
    memoryTrick: "December ends the year with cold",
  },
]

export type PeriodIconType = "Moon" | "Clock" | "Sunrise" | "Sun" | "Cloud" | "Sunset" | "Moon"

export interface ThaiTimeResult {
  thaiSpoken: string
  period: "เที่ยงคืน" | "ตี" | "เช้า" | "เที่ยง" | "บ่าย" | "เย็น" | "ทุ่ม"
  periodEnglish: "Midnight" | "Deep Night" | "Morning" | "Noon" | "Afternoon" | "Evening" | "Night"
  periodIcon: PeriodIconType
}

export function translateToThaiTime(hour: number, minute: number): ThaiTimeResult {
  const h = hour
  const m = minute

  if (h === 0 && m === 0) {
    return { thaiSpoken: "เที่ยงคืน", period: "เที่ยงคืน", periodEnglish: "Midnight", periodIcon: "Moon" }
  }

  if (h >= 1 && h <= 5) {
    const teeHour = h
    const suffix = m > 0 ? ` ${m} นาที` : ""
    return {
      thaiSpoken: `ตี ${teeHour}${suffix}`,
      period: "ตี",
      periodEnglish: "Deep Night",
      periodIcon: "Clock",
    }
  }

  if (h === 6) {
    const suffix = m > 0 ? ` ${m} นาที` : ""
    return {
      thaiSpoken: `6 โมงเช้า${suffix}`,
      period: "เช้า",
      periodEnglish: "Morning",
      periodIcon: "Sunrise",
    }
  }

  if (h >= 7 && h <= 11) {
    const morningHour = h
    const suffix = m > 0 ? ` ${m} นาที` : ""
    return {
      thaiSpoken: `${morningHour} โมงเช้า${suffix}`,
      period: "เช้า",
      periodEnglish: "Morning",
      periodIcon: "Sun",
    }
  }

  if (h === 12) {
    const suffix = m > 0 ? ` ${m} นาที` : ""
    return {
      thaiSpoken: `เที่ยง${suffix}`,
      period: "เที่ยง",
      periodEnglish: "Noon",
      periodIcon: "Sun",
    }
  }

  if (h >= 13 && h <= 15) {
    const bayHour = h - 12
    const suffix = m > 0 ? ` ${m} นาที` : ""
    return {
      thaiSpoken: `บ่าย ${bayHour}${suffix}`,
      period: "บ่าย",
      periodEnglish: "Afternoon",
      periodIcon: "Cloud",
    }
  }

  if (h >= 16 && h <= 17) {
    const eveningHour = h - 12
    const suffix = m > 0 ? ` ${m} นาที` : ""
    return {
      thaiSpoken: `${eveningHour} โมงเย็น${suffix}`,
      period: "เย็น",
      periodEnglish: "Evening",
      periodIcon: "Cloud",
    }
  }

  if (h === 18) {
    const suffix = m > 0 ? ` ${m} นาที` : ""
    return {
      thaiSpoken: `6 โมงเย็น${suffix}`,
      period: "เย็น",
      periodEnglish: "Evening",
      periodIcon: "Sunset",
    }
  }

  if (h >= 19 && h <= 23) {
    const tumHour = h - 18
    const suffix = m > 0 ? ` ${m} นาที` : ""
    return {
      thaiSpoken: `${tumHour} ทุ่ม${suffix}`,
      period: "ทุ่ม",
      periodEnglish: "Night",
      periodIcon: "Moon",
    }
  }

  return { thaiSpoken: "เที่ยงคืน", period: "เที่ยงคืน", periodEnglish: "Midnight", periodIcon: "Moon" }
}
