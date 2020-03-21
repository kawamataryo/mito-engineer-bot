// Set timezone
import dayjs from "dayjs";

const japanLocaleString = new Date().toLocaleString("ja-JP", {
  timeZone: "Asia/Tokyo"
});

export const localeNow = (): dayjs.Dayjs => {
  return dayjs(new Date(japanLocaleString));
};
