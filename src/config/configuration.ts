export default () => ({
  http: {
    port: process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT, 10) : 3000,
    ip: process.env.HTTP_IP ?? '0.0.0.0',
  },
  grpc: {
    port: process.env.GRPC_PORT ? parseInt(process.env.GRPC_PORT, 10) : 3001,
    ip: process.env.GRPC_IP ?? '0.0.0.0',
    packageName: process.env.GRPC_PACKAGE_NAME ?? 'todo',
    protoPath: process.env.GRPC_PROTO_PATH ?? 'src/proto/todo.proto',
  },
  database: {
    iam_mongo: {
      database: process.env.IAM_DATABASE_NAME,
      host: process.env.IAM_DATABASE_HOST,
    },
    todo_mongo: {
      database: process.env.TODO_DATABASE_NAME,
      host: process.env.TODO_DATABASE_HOST,
    },
    marketing_mongo: {
      database: process.env.MARKETING_DATABASE_NAME,
      host: process.env.MARKETING_DATABASE_HOST,
    },
  },
});
