import ComingSoon from '../components/ComingSoon';
import { Maximize } from 'lucide-react';

export default function UpscalerPage() {
    return (
        <ComingSoon
            title="Upscaler"
            description="Ultra-high definition expansion. Boost your images to 4K and 8K with pixel-perfect AI reconstruction."
            icon={<Maximize className="w-8 h-8 text-[#D4FF00]" />}
        />
    );
}
