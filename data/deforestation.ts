/**
 * INPE PRODES annual clear-cut deforestation rates, Brazilian Legal Amazon,
 * km² per "PRODES year" (1 Aug – 31 Jul). Consolidated values; 2025 is the
 * preliminary estimate published 15.10.2025. Source ids: prodes-series, prodes-2025.
 */
export const prodes: { year: number; km2: number; estimate?: boolean }[] = [
  { year: 2004, km2: 27772 },
  { year: 2005, km2: 19014 },
  { year: 2006, km2: 14286 },
  { year: 2007, km2: 11651 },
  { year: 2008, km2: 12911 },
  { year: 2009, km2: 7464 },
  { year: 2010, km2: 7000 },
  { year: 2011, km2: 6418 },
  { year: 2012, km2: 4571 },
  { year: 2013, km2: 5891 },
  { year: 2014, km2: 5012 },
  { year: 2015, km2: 6207 },
  { year: 2016, km2: 7893 },
  { year: 2017, km2: 6947 },
  { year: 2018, km2: 7536 },
  { year: 2019, km2: 10129 },
  { year: 2020, km2: 10851 },
  { year: 2021, km2: 13038 },
  { year: 2022, km2: 11594 },
  { year: 2023, km2: 9064 },
  { year: 2024, km2: 6518 },
  { year: 2025, km2: 5796, estimate: true },
];
