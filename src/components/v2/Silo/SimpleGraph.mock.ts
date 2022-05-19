import { DateTime } from "luxon";

const today = DateTime.now();
const N = 30;

export const mockDepositData = new Array(N).fill(null).map((_, i) => ({
  date: today.minus({ days: N - i }).toJSDate(),
  value: 100_000 + 300 * i + 1000*Math.random(),
}));

export const mockOwnershipPctData = new Array(N).fill(null).map((_, i) => ({
  date: today.minus({ days: N - i }).toJSDate(),
  value: 0.01 - 0.0001 * i + 0.001 * (Math.random() - 0.5)
}));
