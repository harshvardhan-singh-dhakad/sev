export interface AboutFAQItem {
  id: string;
  category: 'heritage' | 'quality' | 'shipping' | 'b2b';
  categoryLabel: string;
  question: string;
  answer: string;
  highlightTag?: string;
}

export const ABOUT_FAQS: AboutFAQItem[] = [
  {
    id: 'indori-vs-regular-sev',
    category: 'heritage',
    categoryLabel: 'Authenticity & Heritage',
    highlightTag: 'Indore Specialty',
    question: 'What makes authentic Indori Sev fundamentally different from ordinary commercial Sev?',
    answer:
      'Unlike mass-produced supermarket namkeen that relies on high-speed industrial extruders, palm oil, and heavy maida (refined flour) fillers, authentic Indori Sev is handcrafted exclusively from 100% pure stone-ground Chana Dal Besan. It is seasoned with heritage spices—most notably pungent Hathras Hing (asafoetida), ajwain (carom seeds), and stone-ground chilies—and hand-pressed through traditional brass/iron jharis directly into hot iron kadhais. This gives Indori Sev its world-famous airy, porous texture that crunches crisply yet melts in the mouth without leaving any greasy aftertaste.',
  },
  {
    id: 'ratlami-sev-clove-punch',
    category: 'heritage',
    categoryLabel: 'Authenticity & Heritage',
    highlightTag: 'GI Heritage',
    question: 'What is Ratlami Sev and why does it have that distinct spicy clove punch?',
    answer:
      'Ratlami Sev is a legendary culinary treasure with a royal history tracing back to the Malwa plateau over 200 years ago. Its signature feature is the generous infusion of freshly ground whole cloves (laung) and coarse black pepper (kali mirch). The cloves provide a warm, tongue-tingling aromatics rather than raw chili burn, imparting natural digestive properties and a deeply comforting aftertaste that pairs impeccably with evening tea, Sev Tamatar sabzi, or drinks.',
  },
  {
    id: 'indore-namkeen-capital',
    category: 'heritage',
    categoryLabel: 'Authenticity & Heritage',
    highlightTag: 'Culinary Capital',
    question: 'Why is Indore universally celebrated as the Namkeen & Street Food Capital of India?',
    answer:
      'Indore’s unique culinary culture, fostered under the Holkar dynasty and sustained through iconic food hubs like Sarafa Bazaar and Chhappan Dukan, elevates snacks into a lifestyle. The crisp semi-arid air of the Malwa plateau, the mineral profile of regional water, and generations of karigars (artisan sweet-makers) who have honed the science of dough moisture and kadhai flame temperatures give Indore namkeen a pedigree that commercial factories anywhere else simply cannot replicate.',
  },
  {
    id: 'ingredients-palm-oil-free',
    category: 'quality',
    categoryLabel: 'Ingredients & Quality',
    highlightTag: '100% Palm Oil Free',
    question: 'Does Aron Bites use palm oil, artificial colors, or chemical preservatives?',
    answer:
      'No, absolutely never. Aron Bites was founded on a strict clean-food manifesto: zero palm oil, zero recycled or burnt oil, zero artificial colorants, zero artificial flavor enhancers (MSG), and zero chemical preservatives. We use only premium cold-pressed and refined edible oils with high smoke points, 100% pure Chana Dal besan, and handpicked natural spices directly sourced from agricultural mandis.',
  },
  {
    id: 'which-sev-for-poha-chaat',
    category: 'heritage',
    categoryLabel: 'Authenticity & Heritage',
    highlightTag: 'Food Pairing Guide',
    question: 'Which Sev variety is best for Indori Poha, Chaat, and Sev Tamatar ki Sabzi?',
    answer:
      'Each dish deserves its perfect textural partner! For authentic Indori Poha and Sev Usal, choose our classic Indori Ujjaini Sev (mild-to-medium spice with gentle hing notes). For street-style Chaat, Sev Puri, Bhel, and Dahi Vada, our Superfine Nylon Sev provides feather-light golden threads that stay crispy. For authentic Dhaba-style Sev Tamatar ki Sabzi, spicy Ratlami Sev is mandatory because its thick cut holds its crunch in boiling gravy while releasing pungent clove aromatics.',
  },
  {
    id: 'shelf-life-and-storage',
    category: 'quality',
    categoryLabel: 'Ingredients & Quality',
    highlightTag: 'Freshness Guarantee',
    question: 'What is the shelf life of Aron Bites Sev, and how should it be stored for maximum crunch?',
    answer:
      'Aron Bites Sev has a shelf life of 4 to 6 months from the packaging date when stored unopened. We utilize multi-layer moisture-barrier, nitrogen-flushed food pouches that protect the delicate oils from oxidation and humidity. Once opened, transfer the namkeen into a clean, bone-dry airtight container (stainless steel or glass preferred) and store at room temperature away from direct sunlight. Never refrigerate sev, as moisture condensation ruins the crunch.',
  },
  {
    id: 'vegetarian-and-jain-diet',
    category: 'quality',
    categoryLabel: 'Ingredients & Quality',
    highlightTag: '100% Pure Veg',
    question: 'Are Aron Bites snacks 100% vegetarian, and do you offer Jain-friendly options?',
    answer:
      'Yes, 100% of our products are certified vegetarian (Green Dot), prepared in dedicated, strictly vegetarian kitchens. For customers following strict Jain dietary preferences, our classic Indori Sev, Ujjaini Sev, and Nylon Sev are prepared entirely without garlic or onion, using pure hing, rock salt, and spices.',
  },
  {
    id: 'fssai-hygiene-standards',
    category: 'quality',
    categoryLabel: 'Ingredients & Quality',
    highlightTag: 'FSSAI Certified',
    question: 'Is Aron Bites FSSAI certified, and what hygiene protocols are maintained during frying and packing?',
    answer:
      'Yes, Aron Bites operates under full FSSAI licensing and adheres to stringent Good Manufacturing Practices (GMP). While we preserve traditional kadhai-crafting techniques, our facility utilizes stainless-steel sorting tables, touchless automated weigh-and-fill multi-head packaging systems, hairnets, aprons, and periodic third-party lab testing for moisture, oil quality, and microbial safety.',
  },
  {
    id: 'pan-india-delivery-timelines',
    category: 'shipping',
    categoryLabel: 'Ordering & Shipping',
    highlightTag: '19,000+ Pincodes',
    question: 'Does Aron Bites deliver to all pin codes across India? What are the delivery timelines?',
    answer:
      'Yes! We ship across all 28 Indian States and 8 Union Territories covering over 19,000 pin codes. Every order is freshly packed and dispatched from our Indore hub within 24 to 48 hours. Metro cities (Delhi-NCR, Mumbai, Bengaluru, Pune, Hyderabad, Ahmedabad, Kolkata, Chennai) typically receive deliveries within 2 to 4 working days, while Tier-2/Tier-3 cities and remote regions take 4 to 6 working days.',
  },
  {
    id: 'shipping-charges-free-delivery',
    category: 'shipping',
    categoryLabel: 'Ordering & Shipping',
    highlightTag: 'Free Delivery Available',
    question: 'What are the shipping charges, and how do I qualify for Free Delivery?',
    answer:
      'We offer 100% Free Pan-India Delivery on all retail orders of ₹499 and above! For orders below ₹499, a nominal flat courier fee of ₹49 is added at checkout. The minimum retail order value is ₹199, making it super easy to try small trial packs without any heavy commitment.',
  },
  {
    id: 'packaging-anti-crush',
    category: 'shipping',
    categoryLabel: 'Ordering & Shipping',
    highlightTag: 'Zero-Crush Packaging',
    question: 'How does Aron Bites protect delicate Sev from getting crushed into powder during transit?',
    answer:
      'Namkeen shipping requires specialized packaging engineering. We pack our sev in durable multi-layer metalized pouches that are nitrogen-cushioned. These pouches are then carefully nestled inside heavy-duty 5-ply corrugated shipper boxes with honeycomb impact-absorbing paper buffers. This guarantees that your sev arrives in intact, crisp golden strands rather than crushed crumbs.',
  },
  {
    id: 'live-tracking-updates',
    category: 'shipping',
    categoryLabel: 'Ordering & Shipping',
    highlightTag: 'Live Tracking',
    question: 'How do I track my order once placed?',
    answer:
      'The moment your package is dispatched from Indore, you receive an automated SMS and WhatsApp update containing your courier tracking number and direct live tracking link. You can also visit https://aronbites.com/track-order at any time, enter your Order ID or phone number, and instantly see the real-time milestone progress of your delivery.',
  },
  {
    id: 'replacement-damage-policy',
    category: 'shipping',
    categoryLabel: 'Ordering & Shipping',
    highlightTag: '100% Customer Delight',
    question: 'What is your policy if my parcel arrives damaged or with a broken seal?',
    answer:
      'We stand behind every packet we ship. In the rare event that your shipment arrives damaged, unsealed, or compromised during courier transit, simply snap a quick photo or video and WhatsApp us at +91 62678 47718 or email support@aronbites.com within 48 hours of delivery. Our customer delight team will arrange an instant free replacement or a full refund without hassle.',
  },
  {
    id: 'festive-gifting-boxes',
    category: 'b2b',
    categoryLabel: 'Bulk & Gifting',
    highlightTag: 'Diwali & Rakhi Hampers',
    question: 'Can I order customized Sev gift hampers for Diwali, Raksha Bandhan, and weddings?',
    answer:
      'Yes! We design bespoke festive and celebration gift hampers featuring our finest Ratlami, Ujjaini, and Nylon Sev assortments, complete with premium festive sleeves, roli-chawal for Rakhi, and custom personalized greeting cards. Whether you want to send 1 gift box to a sibling in another city or 500 corporate gift hampers to employees nationwide, we manage multi-address fulfillment seamlessly.',
  },
  {
    id: 'bulk-wholesale-orders',
    category: 'b2b',
    categoryLabel: 'Bulk & Gifting',
    highlightTag: '10 KG to 500 KG+ (Quintals)',
    question: 'How can sweet shops, caterers, cloud kitchens, and restaurants order wholesale bulk namkeen?',
    answer:
      'We supply commercial establishments, HORECA businesses, cloud kitchens, and retail chains with bulk quantities starting from 10 KG up to multiple quintals (500 KG+). Bulk orders enjoy tiered wholesale factory rates, flexible packaging options (bulk food-grade bags or retail-ready branded packs), and dedicated logistics handling. Visit our Bulk Orders page (https://aronbites.com/bulk-orders) or contact our B2B team for a fast custom quotation.',
  },
  {
    id: 'free-b2b-samples',
    category: 'b2b',
    categoryLabel: 'Bulk & Gifting',
    highlightTag: 'Free Taste Testing',
    question: 'Can prospective B2B clients and distributors get a free sample box before placing bulk orders?',
    answer:
      'Yes, absolutely. We believe our taste, aroma, and crunch speak for themselves. Verified restaurants, caterers, grocery distributors, and corporate gift buyers can request a Free Business Sample Box directly from our website at https://aronbites.com/samples. Our B2B team dispatches the trial assortment within 24 hours so you can test before investing.',
  },
];
