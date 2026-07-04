const redis = require("redis");

const createMockRedis = () => {
  const store = {};
  console.log("Redis client initialized in MOCK mode.");
  return {
    get: async (key) => store[key] || null,
    set: async (key, val, mode, ttl) => {
      store[key] = val;
      return "OK";
    },
    del: async (key) => {
      delete store[key];
      return 1;
    },
    incr: async (key) => {
      store[key] = (store[key] || 0) + 1;
      return store[key];
    },
    quit: async () => "OK",
    connect: async () => true
  };
};

let activeClient = null;

const initRedis = async () => {
  if (activeClient) return activeClient;
  
  try {
    const client = redis.createClient({
      url: process.env.REDIS_URI || "redis://127.0.0.1:6379",
      socket: {
        reconnectStrategy: () => false
      }
    });

    client.on("error", () => {});

    await client.connect();
    activeClient = client;
    console.log("Redis Connected successfully.");
  } catch (err) {
    console.warn("Failed to connect to Redis. Falling back to in-memory Mock Redis.");
    activeClient = createMockRedis();
  }
  return activeClient;
};

module.exports = {
  initRedis,
  get: async (key) => {
    const client = await initRedis();
    return client.get(key);
  },
  set: async (key, val, mode, ttl) => {
    const client = await initRedis();
    return client.set(key, val, mode, ttl);
  },
  del: async (key) => {
    const client = await initRedis();
    return client.del(key);
  },
  incr: async (key) => {
    const client = await initRedis();
    return client.incr(key);
  },
  quit: async () => {
    if (activeClient) await activeClient.quit();
  },
  connect: async () => {
    await initRedis();
  }
};
