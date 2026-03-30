type RefreshCurrentPageDeps = {
  queryClient: {
    refetchQueries: (filters: { type: 'active' }) => Promise<unknown>
  }
  router: {
    invalidate: () => Promise<unknown> | unknown
  }
}

export async function refreshCurrentPage({
  queryClient,
  router,
}: RefreshCurrentPageDeps) {
  await Promise.all([
    queryClient.refetchQueries({ type: 'active' }),
    Promise.resolve(router.invalidate()),
  ])
}
