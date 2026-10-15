export default {
  resolve: {
    preserveSymlinks: true
  },
  test: {
    pool: 'threads',
    poolOptions: {
      threads: { singleThread: true }
    }
  }
};
