export default () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
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
