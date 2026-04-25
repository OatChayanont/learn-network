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
