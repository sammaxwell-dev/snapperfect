import ComingSoon from '../components/ComingSoon';
import { SunMedium } from 'lucide-react';

export default function RelightPage() {
    return (
        <ComingSoon
            title="Relight"
            description="Dynamic shadow and lighting control. Change the atmosphere of any product photo with realistic AI-driven light sources."
            icon={<SunMedium className="w-8 h-8 text-[#D4FF00]" />}
        />
    );
}
