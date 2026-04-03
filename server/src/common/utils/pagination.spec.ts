import { parsePagination } from './pagination';

describe('parsePagination', () => {
  it('should convert query string pagination into prisma pagination', () => {
    expect(parsePagination({ pageNum: '2', pageSize: '20' })).toEqual({
      skip: 20,
      take: 20,
      pageNum: 2,
      pageSize: 20,
    });
  });

  it('should fallback to defaults when pagination is missing', () => {
    expect(parsePagination({})).toEqual({
      skip: 0,
      take: 10,
      pageNum: 1,
      pageSize: 10,
    });
  });
});
