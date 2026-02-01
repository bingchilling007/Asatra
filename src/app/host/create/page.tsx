// Create Listing Page

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createListing } from '@/app/actions/host';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { canAccessHost } from '@/lib/rbac';
import { AMENITIES_LIST, Province, PropertyType } from '@/types';

export default async function CreateListingPage() {
    const session = await auth();

    if (!session?.user || !canAccessHost(session.user.role)) {
        redirect('/become-host');
    }

    const sectionStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #eee',
        marginBottom: '2rem',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500' as const,
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        marginBottom: '1rem',
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f9f9f9' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                Create a New Listing
            </h1>

            <form action={createListing}>
                {/* Basic Info */}
                <div style={sectionStyle}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Basic Info</h2>

                    <label style={labelStyle}>Listing Title</label>
                    <input type="text" name="title" required style={inputStyle} placeholder="e.g. Cozy Cottage in Murree" />

                    <label style={labelStyle}>Description</label>
                    <textarea name="description" required rows={4} style={inputStyle} placeholder="Describe your place..." />

                    <label style={labelStyle}>Property Type</label>
                    <select name="propertyType" required style={inputStyle}>
                        {Object.values(PropertyType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Location */}
                <div style={sectionStyle}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Location</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Province/Region</label>
                            <select name="province" required style={inputStyle}>
                                {Object.values(Province).map(prov => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>City</label>
                            <input type="text" name="city" required style={inputStyle} placeholder="e.g. Islamabad" />
                        </div>
                    </div>

                    <label style={labelStyle}>Full Address</label>
                    <input type="text" name="address" required style={inputStyle} placeholder="Street address..." />
                </div>

                {/* Details */}
                <div style={sectionStyle}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Property Details</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Guests</label>
                            <input type="number" name="maxGuests" min="1" defaultValue="2" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Bedrooms</label>
                            <input type="number" name="bedrooms" min="0" defaultValue="1" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Beds</label>
                            <input type="number" name="beds" min="0" defaultValue="1" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Bathrooms</label>
                            <input type="number" name="bathrooms" min="0" defaultValue="1" required style={inputStyle} />
                        </div>
                    </div>

                    <label style={{ ...labelStyle, marginTop: '1rem' }}>Amenities</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                        {AMENITIES_LIST.map(amenity => (
                            <label key={amenity.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" name="amenities" value={amenity.id} />
                                {amenity.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Pricing & Photos */}
                <div style={sectionStyle}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Pricing & Photos</h2>

                    <label style={labelStyle}>Price per Night (PKR)</label>
                    <input type="number" name="pricePerNight" min="100" required style={inputStyle} placeholder="e.g. 5000" />

                    <label style={labelStyle}>Cover Photo</label>
                    <input type="file" name="image" accept="image/*" required style={inputStyle} />
                </div>

                <SubmitButton style={{ width: '100%', fontSize: '1.2rem' }}>
                    Publish Listing
                </SubmitButton>
            </form>
        </div>
    );
}
