import { json } from '@sveltejs/kit';
import { calculateSubnet } from '$lib/functions/subnetCalculator';

export async function GET({ url }) {
    const ip = url.searchParams.get('ip');
    const prefix = url.searchParams.get('prefix');

    if (!ip || !prefix) {
        return json({ error: 'Missing ip or prefix parameter' }, { status: 400 });
    }

    const prefixNum = parseInt(prefix, 10);
    const result = calculateSubnet(ip, prefixNum);

    if (!result) {
        return json({ error: 'Invalid IP or prefix' }, { status: 400 });
    }

    return json(result);
}
