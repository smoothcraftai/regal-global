import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const { PrismaClient } = pkg;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('RegalAdmin@2026', 12);

  await prisma.adminUser.upsert({
    where: { email: 'admin@regalglobal.com' },
    update: {},
    create: {
      name: 'Regal Super Admin',
      email: 'admin@regalglobal.com',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  const properties = [
    {
      referenceCode: 'PROP-101',
      title: 'The Sky Penthouse at One Palm',
      slug: 'sky-penthouse-one-palm',
      destination: 'Dubai, UAE',
      type: 'Penthouse',
      purpose: 'Sale',
      priceUSD: 18500000,
      priceFormatted: 'AED 68,000,000 ($18,500,000 USD)',
      bedrooms: 5,
      bathrooms: 6,
      area: '11,200 Sq.Ft',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      sourceType: 'OWN',
      sourceOrg: 'Regal Global UAE',
      description: 'Full-floor luxury sky residence offering 360-degree panoramic views of Dubai Marina and the Arabian Gulf. Includes private lap pool, private elevator access, and Italian marble finishes.',
    },
    {
      referenceCode: 'PROP-102',
      title: 'Belgravia Heritage Townhouse',
      slug: 'belgravia-heritage-townhouse',
      destination: 'London, UK',
      type: 'Villa',
      purpose: 'Sale',
      priceUSD: 14200000,
      priceFormatted: 'GBP £11,500,000 ($14,200,000 USD)',
      bedrooms: 6,
      bathrooms: 5,
      area: '6,800 Sq.Ft',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      sourceType: 'OWN',
      sourceOrg: 'Regal Global UK',
      description: 'Grade-II listed Georgian townhouse meticulously restored to modern luxury standards. Features private landscaped square gardens, climate-controlled wine cellar, and staff quarters.',
    },
    {
      referenceCode: 'PROP-103',
      title: 'Worli Sea Face Luxury Suite',
      slug: 'worli-sea-face-suite',
      destination: 'Mumbai, India',
      type: 'Apartment',
      purpose: 'Sale',
      priceUSD: 6500000,
      priceFormatted: 'INR ₹54,00,00,000 ($6,500,000 USD)',
      bedrooms: 4,
      bathrooms: 4,
      area: '4,500 Sq.Ft',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      sourceType: 'PARTNER',
      sourceOrg: 'Regal Global India',
      description: 'Unobstructed Arabian Sea views in Mumbai’s premier post-code. High floor, bespoke interior automation, and private concierge services.',
    },
    {
      referenceCode: 'PROP-104',
      title: 'Nassim Hill Sanctuary Villa',
      slug: 'nassim-hill-sanctuary',
      destination: 'Singapore',
      type: 'Villa',
      purpose: 'Sale',
      priceUSD: 22000000,
      priceFormatted: 'SGD $29,500,000 ($22,000,000 USD)',
      bedrooms: 5,
      bathrooms: 7,
      area: '8,900 Sq.Ft',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      sourceType: 'OWN',
      sourceOrg: 'Regal Global Master',
      description: 'Rare freehold bungalow situated in the elite Nassim enclave adjacent to the Singapore Botanic Gardens. Includes private infinity pool and underground 6-car showroom garage.',
    },
    {
      referenceCode: 'PROP-105',
      title: 'Marina Bay Waterfront Residence',
      slug: 'marina-bay-waterfront',
      destination: 'Singapore',
      type: 'Apartment',
      purpose: 'Rent',
      priceUSD: 240000,
      priceFormatted: 'SGD $25,000 / Month ($20,000 USD/mo)',
      bedrooms: 3,
      bathrooms: 3,
      area: '2,800 Sq.Ft',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
      sourceType: 'PARTNER',
      sourceOrg: 'Regal Global Master',
      description: 'Fully furnished ultra-luxury apartment overlooking the Iconic Marina Bay Sands skyline. High-ceiling floor-to-ceiling glass and 24-hour private valet.',
    },
    {
      referenceCode: 'PROP-106',
      title: 'Emirates Hills Golf Estate',
      slug: 'emirates-hills-estate',
      destination: 'Dubai, UAE',
      type: 'Villa',
      purpose: 'Sale',
      priceUSD: 26500000,
      priceFormatted: 'AED 97,000,000 ($26,500,000 USD)',
      bedrooms: 7,
      bathrooms: 9,
      area: '18,000 Sq.Ft',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      sourceType: 'DEVELOPER',
      sourceOrg: 'Regal Global UAE',
      description: 'Palatial custom-built mansion facing the championship golf course. Equipped with private home cinema, spa wellness suite, and subterranean car vault.',
    },
  ];

  for (const prop of properties) {
    await prisma.property.upsert({
      where: { referenceCode: prop.referenceCode },
      update: {},
      create: prop,
    });
  }

  await prisma.project.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'The Royal Palm Residences',
        developer: 'Emaar Properties',
        location: 'Palm Jumeirah, Dubai',
        completionDate: 'Q4 2027',
        projectStatus: 'Under Construction',
        description: 'Exclusive beachfront towers featuring bespoke interior design by Armani Casa.',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Mayfair Square Collection',
        developer: 'Berkeley Group',
        location: 'Mayfair, London',
        completionDate: 'Q2 2026',
        projectStatus: 'Newly Launched',
        description: "Ultra-luxury heritage apartments situated in London's finest post-code district.",
        image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      },
    ],
  });

  await prisma.insight.createMany({
    skipDuplicates: true,
    data: [
      {
        category: 'Market Report 2026',
        title: 'Q4 International Prime Residential Wealth Index',
        excerpt: 'A detailed analysis of capital flows into Dubai, London, and Singapore luxury markets.',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      },
      {
        category: 'Advisory',
        title: 'Cross-Border Tax & Regulatory Blueprint for Investors',
        excerpt: 'Essential considerations when acquiring secondary holiday homes and investment portfolios.',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      },
      {
        category: 'Design Trends',
        title: 'Sustainable Luxury: The Rise of Biophilic Penthouses',
        excerpt: 'How top developers are integrating eco-conscious wellness architecture in mega-cities.',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      },
    ],
  });

  console.log('Seed completed: Admin (admin@regalglobal.com / RegalAdmin@2026) & initial inventory created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });