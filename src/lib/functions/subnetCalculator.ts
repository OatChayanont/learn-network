import type { IPv4Details } from '../models/subnet';

export function calculateSubnet(ipStr: string, prefix: number): IPv4Details | null {
    if (prefix < 0 || prefix > 32) return null;
    
    const ipParts = ipStr.split('.');
    if (ipParts.length !== 4) return null;
    
    const octets = ipParts.map(p => parseInt(p, 10));
    if (octets.some(o => isNaN(o) || o < 0 || o > 255)) return null;

    // Convert IP to a 32-bit unsigned integer
    const ipNum = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
    
    // Calculate Mask Integer
    // prefix 0 gives 0, prefix 32 gives 0xFFFFFFFF
    const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    
    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | (~maskNum)) >>> 0;
    
    const firstHostNum = prefix >= 31 ? networkNum : (networkNum + 1) >>> 0;
    const lastHostNum = prefix >= 31 ? broadcastNum : (broadcastNum - 1) >>> 0;
    
    // Total addresses
    const totalAddresses = Math.pow(2, 32 - prefix);
    
    // Usable hosts
    let usableHosts = totalAddresses - 2;
    if (usableHosts < 0) usableHosts = 0; // for /31 and /32
    
    const numToIp = (num: number) => {
        return [
            (num >>> 24) & 255,
            (num >>> 16) & 255,
            (num >>> 8) & 255,
            num & 255
        ].join('.');
    };
    
    const maskOctets = [
        (maskNum >>> 24) & 255,
        (maskNum >>> 16) & 255,
        (maskNum >>> 8) & 255,
        maskNum & 255
    ];

    const toBinaryString = (num: number) => {
        return num.toString(2).padStart(32, '0');
    };

    return {
        ip: ipStr,
        prefix,
        networkAddress: numToIp(networkNum),
        broadcastAddress: numToIp(broadcastNum),
        subnetMask: numToIp(maskNum),
        firstHost: numToIp(firstHostNum),
        lastHost: numToIp(lastHostNum),
        usableHosts,
        totalAddresses,
        ipBinaryString: toBinaryString(ipNum),
        maskBinaryString: toBinaryString(maskNum),
        ipOctets: octets,
    maskOctets
  };
}

// --- Utility Functions for Pagination and Hierarchy ---

export function ipToNum(ipStr: string): number {
  if (!ipStr) return 0;
  const p = ipStr.split('.').map(Number);
  if (p.length !== 4) return 0;
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}

export function numToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

/**
 * Calculates the classful parent network of a given IP and prefix.
 */
export function getParentNetwork(ipStr: string, currentPrefix: number): { network: string, prefix: number } {
  const p = ipStr.split('.').map(Number);
  const firstOctet = p[0] || 0;
  let naturalPrefix = 24; // Default to Class C

  if (firstOctet >= 1 && firstOctet <= 126) naturalPrefix = 8;
  else if (firstOctet >= 128 && firstOctet <= 191) naturalPrefix = 16;
  else if (firstOctet >= 192 && firstOctet <= 223) naturalPrefix = 24;

  const parentPrefix = Math.min(naturalPrefix, currentPrefix);
  
  const num = ipToNum(ipStr);
  const mask = parentPrefix === 0 ? 0 : (~0 << (32 - parentPrefix)) >>> 0;
  const netNum = (num & mask) >>> 0;

  return { network: numToIp(netNum), prefix: parentPrefix };
}

/**
 * Gets a specific subnet by index from the parent network.
 */
export function getSubnetAtIndex(parentNetworkIp: string, currentPrefix: number, index: number): string {
    const parentNum = ipToNum(parentNetworkIp);
    const stepSize = Math.pow(2, 32 - currentPrefix);
    const MathSafeIndex = BigInt(index);
    const MathSafeStepSize = BigInt(stepSize);
    const subnetNum = BigInt(parentNum) + (MathSafeIndex * MathSafeStepSize);
    return `${numToIp(Number(subnetNum))}/${currentPrefix}`;
}

/**
 * Gets a specific IP member by index within a network.
 */
export function getMemberAtIndex(networkIp: string, index: number): string {
    const startNum = ipToNum(networkIp);
    // Be careful with large index bounds exceeding 32-bit uint if it were possible
    const memberNum = BigInt(startNum) + BigInt(index);
    return numToIp(Number(memberNum));
}
