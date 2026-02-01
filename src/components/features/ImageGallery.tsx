import Image from 'next/image';
import { ListingImage } from '@prisma/client';

export function ImageGallery({ images }: { images: ListingImage[] }) {
    if (images.length === 0) return null;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '0.5rem',
            height: '400px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '2rem',
        }}>
            <div style={{ position: 'relative', height: '100%' }}>
                <Image
                    src={images[0].url}
                    alt="Main View"
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '0.5rem' }}>
                {images.slice(1, 3).map((img, i) => (
                    <div key={img.id} style={{ position: 'relative', height: '100%' }}>
                        <Image
                            src={img.url}
                            alt={`Gallery ${i}`}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                ))}
                {images.length < 2 && (
                    <div style={{ backgroundColor: '#eee' }}></div>
                )}
            </div>
        </div>
    );
}
