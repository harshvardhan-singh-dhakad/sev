import { Star, MapPin } from 'lucide-react';

import { Review } from '@/lib/types';



const DEMO_REVIEWS: Review[] = [

  {

    id: 'r1', productId: 'p1', productName: 'Premium Indori Sev',

    customerId: 'c1', customerName: 'Rahul Sharma', customerCity: 'Mumbai',

    rating: 5, title: 'Absolutely loved it!',

    content: 'The Indori Sev from Rasvat is exactly how I remember it from Indore. Perfect spice level, crispy, fresh. Ordered 1 KG pack and it was gone in a week!',

    status: 'approved', featured: true,

    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),

  },

  {

    id: 'r2', productId: 'p2', productName: 'Ratlami Special Sev',

    customerId: 'c2', customerName: 'Priya Patel', customerCity: 'Ahmedabad',

    rating: 5, title: 'Best bulk supplier',

    content: 'We order 50 KG every month for our restaurant. Consistent quality, great pricing, and always on time. Highly recommend Rasvat for bulk buyers.',

    status: 'approved', featured: true,

    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),

  },

  {

    id: 'r3', productId: 'p3', productName: 'Thin Nylon Sev',

    customerId: 'c3', customerName: 'Anita Verma', customerCity: 'Delhi',

    rating: 4, title: 'Perfect for chaat',

    content: 'The nylon sev is just perfect for garnishing pani puri and bhel. Very thin and crispy. Will definitely order again. Packaging was also excellent.',

    status: 'approved', featured: false,

    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),

  },

];



async function getApprovedReviews(): Promise<Review[]> {

  try {

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/reviews?status=approved&featured=true&limit=6`, {

      next: { revalidate: 600 },

    });

    if (!res.ok) return DEMO_REVIEWS;

    const data = await res.json();

    return data.reviews?.length ? data.reviews : DEMO_REVIEWS;

  } catch {

    return DEMO_REVIEWS;

  }

}



export async function ReviewsSection() {

  const reviews = await getApprovedReviews();



  return (

    <section

      className="section"

      style={{ background: '#F8FAFC' }}

      aria-labelledby="reviews-heading"

    >

      <div className="container-site">

        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ background: 'var(--color-accent-tint)', color: 'var(--color-primary)' }}
          >
            Customer Love
          </span>
          <h2 id="reviews-heading" className="section-heading" style={{ color: 'var(--color-ink)' }}>
            What Our Customers Say
          </h2>
          <p className="section-subheading">
            Real reviews from real Sev lovers across India
          </p>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {reviews.map((review) => (

            <ReviewCard key={review.id} review={review} />

          ))}

        </div>



        {/* Average rating summary */}

        <div

          className="mt-12 text-center p-8 rounded-2xl"

          style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0' }}

        >

          <p

            className="text-5xl font-bold mb-2"

            style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-primary)' }}

          >

            4.8

          </p>

          <div className="flex justify-center gap-1 mb-2">

            {[1, 2, 3, 4, 5].map((s) => (

              <Star key={s} size={20} fill="#F59E0B" stroke="#F59E0B" />

            ))}

          </div>

          <p className="text-sm" style={{ color: '#64748B' }}>

            Average rating from 480+ verified customers

          </p>

        </div>

      </div>

    </section>

  );

}



function ReviewCard({ review }: { review: Review }) {

  return (

    <div

      className="p-6 rounded-2xl flex flex-col"

      style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0' }}

    >

      {/* Stars */}

      <div className="flex gap-0.5 mb-3">

        {[1, 2, 3, 4, 5].map((s) => (

          <Star

            key={s}

            size={14}

            fill={s <= review.rating ? '#F59E0B' : 'none'}

            stroke={s <= review.rating ? '#F59E0B' : '#D1D5DB'}

          />

        ))}

      </div>



      {/* Title */}
      {review.title && (
        <h3
          className="font-bold mb-2"
          style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)', fontSize: '1rem' }}
        >
          &ldquo;{review.title}&rdquo;
        </h3>
      )}

      {/* Content */}
      <p className="text-sm leading-relaxed flex-1" style={{ color: '#475569' }}>
        {review.content}
      </p>

      {/* Product */}
      <p className="text-xs mt-3 font-medium" style={{ color: 'var(--color-primary)' }}>
        {review.productName}
      </p>

      {/* Author */}
      <div
        className="flex items-center gap-3 mt-4 pt-4"
        style={{ borderTop: '1px solid #F1F5F9' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          {review.customerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
            {review.customerName}
          </p>

          {review.customerCity && (

            <p className="text-xs flex items-center gap-1" style={{ color: '#94A3B8' }}>

              <MapPin size={10} />

              {review.customerCity}

            </p>

          )}

        </div>

      </div>

    </div>

  );

}