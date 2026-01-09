import ComingSoon from '../components/ComingSoon';
import { Shirt } from 'lucide-react';

export default function FashionMotionPage() {
    return (
        <ComingSoon
            title="AI Fashion Motion"
            description="Transform static clothing photos into dynamic lifestyle videos. Watch your designs move naturally on AI-generated models."
            icon={<Shirt className="w-8 h-8 text-[#D4FF00]" />}
        />
    );
}
