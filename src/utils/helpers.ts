import dayjs from 'dayjs';

export const formatDate = (
  date: string | Date,
  format = 'YYYY-MM-DD',
): string => {
  return dayjs(date).format(format);
};

export const formatTime = (time: string): string => {
  // Parses duration and times
  if (!time) {
    return '';
  }
  const parts = time.split(':');
  if (parts.length < 2) {
    return time;
  }
  return `${parts[0]}:${parts[1]}`;
};

export const capitalize = (str: string): string => {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
