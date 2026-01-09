import ComingSoon from '../components/ComingSoon';
import { Fingerprint } from 'lucide-react';

export default function BrandIdentityPage() {
    return (
        <ComingSoon
            title="Brand Identity"
            description="Generate a complete visual identity for your brand. From logos to color schemes and social media assets, all powered by AI."
            icon={<Fingerprint className="w-8 h-8 text-[#D4FF00]" />}
        />
    );
}
