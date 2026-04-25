export interface IPv4Details {
    ip: string;
    prefix: number;
    networkAddress: string;
    broadcastAddress: string;
    subnetMask: string;
    firstHost: string;
    lastHost: string;
    usableHosts: number;
    totalAddresses: number;

    // For visualization
    ipBinaryString: string; 
    maskBinaryString: string; 
    
    // Arrays for easy looping
    ipOctets: number[];
    maskOctets: number[];
}
