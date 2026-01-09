import ComingSoon from '../components/ComingSoon';
import { LayoutGrid } from 'lucide-react';

export default function LibraryPage() {
    return (
        <ComingSoon
            title="Library"
            description="Your personal asset vault. Organize, tag, and manage all your AI-generated creations in one high-speed workspace."
            icon={<LayoutGrid className="w-8 h-8 text-[#D4FF00]" />}
        />
    );
}
