import { parse } from 'csv-parse/sync';
import type { Country } from '../types/Country';

const COUNTRY_HEADERS = ['code', 'name'] as const;

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function getCountryHeaders(headers: string[]): string[] {
  const normalizedHeaders = headers.map(normalizeHeader);
  const expectedHeaders = [...COUNTRY_HEADERS];
  const hasExpectedHeaders =
    normalizedHeaders.length === expectedHeaders.length &&
    expectedHeaders.every((header) => normalizedHeaders.includes(header));

  if (!hasExpectedHeaders) {
    throw new Error(
      'Invalid countries CSV headers: expected exactly code and name',
    );
  }

  return normalizedHeaders;
}

export function parseCountriesCsv(csv: string): Country[] {
  const records = parse<Record<string, string>>(csv, {
    bom: true,
    columns: getCountryHeaders,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((record, index) => {
    const code = record.code;
    const name = record.name;

    if (!/^[A-Z]{2}$/.test(code)) {
      throw new Error(
        `Invalid country code on CSV line ${index + 2}: expected two uppercase letters`,
      );
    }

    if (!name) {
      throw new Error(
        `Invalid country name on CSV line ${index + 2}: value is required`,
      );
    }

    return { code, name };
  });
}
