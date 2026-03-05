const config = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/chatbot_db",
    },
  },
}

export default config
