import ComingSoon from '../components/ComingSoon';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <ComingSoon
            title="Settings"
            description="Fine-tune your Snapperfect experience. Manage API keys, billing, and personalized AI model preferences."
            icon={<Settings className="w-8 h-8 text-[#D4FF00]" />}
        />
    );
}
