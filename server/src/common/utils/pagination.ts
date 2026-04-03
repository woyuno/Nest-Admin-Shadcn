export function parsePagination(input: {
  pageNum?: number | string;
  pageSize?: number | string;
}) {
  const pageNum = Number(input.pageNum ?? 1);
  const pageSize = Number(input.pageSize ?? 10);

  return {
    pageNum,
    pageSize,
    skip: pageSize * (pageNum - 1),
    take: pageSize,
  };
}
