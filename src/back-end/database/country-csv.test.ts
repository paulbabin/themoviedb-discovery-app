import { describe, expect, it } from 'vitest';
import { parseCountriesCsv } from './country-csv';

describe('parseCountriesCsv', () => {
  it('parses headers in any order, case-insensitively, with BOM and CRLF', () => {
    // Arrange
    const csv = '\uFEFF NAME , CODE\r\n France , FR \r\n';

    // Act
    const countries = parseCountriesCsv(csv);

    // Assert
    expect(countries).toEqual([{ code: 'FR', name: 'France' }]);
  });

  it('supports commas and escaped quotes inside quoted names', () => {
    // Arrange
    const csv = 'code,name\nUS,"United States, ""America"""\n';

    // Act
    const countries = parseCountriesCsv(csv);

    // Assert
    expect(countries).toEqual([
      { code: 'US', name: 'United States, "America"' },
    ]);
  });

  it('ignores empty lines and accepts a document containing only headers', () => {
    // Arrange
    const csv = 'code,name\n\n';

    // Act
    const countries = parseCountriesCsv(csv);

    // Assert
    expect(countries).toEqual([]);
  });

  it('rejects invalid headers, values, and malformed CSV syntax', () => {
    // Arrange
    const invalidDocuments = [
      ['code,label\nFR,France', /Invalid countries CSV headers/],
      ['code,name\nfR,France', /Invalid country code/],
      ['code,name\nFRA,France', /Invalid country code/],
      ['code,name\nFR,', /Invalid country name/],
      ['code,name\n"FR,France', /Quote Not Closed/],
    ] as const;

    // Act and Assert
    for (const [csv, error] of invalidDocuments) {
      expect(() => parseCountriesCsv(csv)).toThrow(error);
    }
  });
});
