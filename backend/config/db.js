const dns = require("dns");
const mongoose = require("mongoose");

// Some corporate/VPN DNS resolvers intermittently refuse lookups for
// *.mongodb.net (both SRV and plain A records), causing querySrv
// ECONNREFUSED or TLS handshake errors. Falling back to public resolvers
// for Node's own DNS lookups avoids depending on that resolver.
dns.setServers(["8.8.8.8", "1.1.1.1", ...dns.getServers()]);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
