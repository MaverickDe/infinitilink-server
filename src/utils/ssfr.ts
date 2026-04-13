// import dns from "dns/promises";
// import { URL } from "url";

// function isPrivateIP(ip) {
//   return (
//     ip.startsWith("10.") ||
//     ip.startsWith("127.") ||
//     ip.startsWith("0.") ||
//     ip.startsWith("192.168.") ||
//       ip.startsWith("169.254.") ||
//     (ip.startsWith("172.") &&
//       parseInt(ip.split(".")[1]) >= 16 &&
//       parseInt(ip.split(".")[1]) <= 31)
//   );
// }

// const listOfMyDomainOrwhatever = [
//   "stemgate.com"
// ];

// function isMYDomain(hostname) {
//   return listOfMyDomainOrwhatever.some(domain => {
//     return (
//       hostname === domain ||
//       hostname.endsWith("." + domain)
//     );
//   });
// }

// export async function isValidUrl(url) {

//     // let url = url_[0]
//     console.log("urlllllllistOfMyDomainOrwhatever",url,listOfMyDomainOrwhatever)
//   try {
//     const parsed = new URL(url);

//     // 1. Only HTTPS
//     if (parsed.protocol !== "https:") {
//       return false;
//     }

//     const hostname = parsed.hostname;

//     // 2. Block localhost
//     if (hostname === "localhost") {
//       return false;
//     }

//     // 3. Block your own domains
//     console.log(isMYDomain(hostname),hostname,"hostname")
//     if (isMYDomain(hostname)) {
//       return false;
//     }

//     // 4. Resolve DNS
//     const addresses = await dns.lookup(hostname, { all: true });

//     // 5. Block private/internal IPs
//     for (const addr of addresses) {
//       if (isPrivateIP(addr.address)) {
//         return false;
//       }
//     }

//     return true;
//   } catch (err) {
//     console.log(err)
//     return false;
//   }
// }

import dns from "dns/promises";
import { URL } from "url";

function isPrivateIP(ip: string) {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("127.") ||
    ip.startsWith("0.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("169.254.") || // 🔥 metadata / link-local (important)
    (ip.startsWith("172.") &&
      (() => {
        const second = parseInt(ip.split(".")[1]);
        return second >= 16 && second <= 31;
      })())
  );
}

const listOfMyDomainOrwhatever = ["stemgate.com"];

function isMYDomain(hostname: string) {
  return listOfMyDomainOrwhatever.some((domain) => {
    return (
      hostname === domain ||
      hostname.endsWith("." + domain)
    );
  });
}

function isBlockedHostname(hostname: string) {
  // 🚫 localhost + subdomains
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost")
  ) {
    return true;
  }

  // 🚫 no TLD (e.g. "internal-service", "dev.stemgate")
  if (!hostname.includes(".")) {
    return true;
  }

  return false;
}

export async function isValidUrl(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);

    // ✅ Only HTTPS
    if (parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname;

    // 🚫 Block obvious bad hosts
    if (isBlockedHostname(hostname)) return false;

    // 🚫 Block your own domains
    if (isMYDomain(hostname)) return false;

    // 🔍 Resolve DNS
    const addresses = await dns.lookup(hostname, { all: true });

    if (!addresses.length) return false;

    // 🚫 Block private/internal IPs
    for (const addr of addresses) {
      if (isPrivateIP(addr.address)) {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.log(err)
    return false;
  }
}