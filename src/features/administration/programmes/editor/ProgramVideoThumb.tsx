import Image from 'next/image';
import { vimeoId, ytId } from './program-editor.utils';

export default function ProgramVideoThumb({ url }: { url: string }) {
    const youtube = ytId(url);
    const vimeo = vimeoId(url);

    if (!url) return <div className="text-xs text-muted-foreground">Aperçu vidéo</div>;
    if (youtube)
        return (
            <div className="relative h-24 w-full overflow-hidden rounded-lg border">
                <Image src={`https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`} alt="YouTube" fill sizes="200px" className="object-cover" unoptimized />
            </div>
        );
    if (vimeo)
        return (
            <div className="relative h-24 w-full overflow-hidden rounded-lg border">
                <Image src={`https://vumbnail.com/${vimeo}.jpg`} alt="Vimeo" fill sizes="200px" className="object-cover" unoptimized />
            </div>
        );
    return <div className="text-xs text-muted-foreground">MP4 : pas de miniature</div>;
}
