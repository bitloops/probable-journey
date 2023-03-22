export interface AuthEnvironmentVariables {
  jwtSecret: string;
}

export default () => ({
  jwtSecret: process.env.JWT_SECRET ?? 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B',
});
