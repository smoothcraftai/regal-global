import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export default function PublicHome() {
  const [properties, setProperties] = useState([]);
  const [filteredProps, setFilteredProps] = useState([]);
  const [projects, setProjects] = useState([]);
  const [insights, setInsights] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  const [destination, setDestination] = useState('All');
  const [propType, setPropType] = useState('All');
  const [purpose, setPurpose] = useState('All');
  const [maxPrice, setMaxPrice] = useState(999999999);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryContext, setEnquiryContext] = useState('General Enquiry');
  const [toast, setToast] = useState(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    enquiryType: 'Buy',
    message: '',
  });

  const [modalForm, setModalForm] = useState({
    name: '',
    email: '',
    phone: '',
    budget: 'Under $5M',
    message: '',
  });

  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    fetch(`${API_BASE}/public/bootstrap`)
      .then((res) => res.json())
      .then((data) => {
        const props = data.properties || [];
        setProperties(props);
        setFilteredProps(props);
        setProjects(data.projects || []);
        setInsights(data.insights || []);
      })
      .catch(() => {});
  }, []);

  const applyFilters = (destVal = destination, typeVal = propType, purposeVal = purpose, priceVal = maxPrice) => {
    const result = properties.filter((item) => {
      const mDest = destVal === 'All' || item.destination === destVal;
      const mType = typeVal === 'All' || item.type === typeVal;
      const mPurpose = purposeVal === 'All' || item.purpose === purposeVal;
      const mPrice = Number(item.priceUSD) <= Number(priceVal);
      return mDest && mType && mPurpose && mPrice;
    });
    setFilteredProps(result);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setPropType(tab);
    applyFilters(destination, tab, purpose, maxPrice);
  };

  const openEnquiry = (ctx = 'General Enquiry') => {
    setEnquiryContext(ctx);
    setEnquiryModalOpen(true);
  };

  const submitEnquiry = async (payload) => {
    const res = await fetch(`${API_BASE}/public/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Enquiry Transmitted', `Reference ${data.referenceId} logged. Our advisor will contact you shortly.`);
    } else {
      showToast('Submission Issue', data.error || 'Please verify your details and try again.');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    await submitEnquiry({
      ...contactForm,
      context: 'Direct Website Contact Form',
    });
    setContactForm({ name: '', email: '', phone: '', enquiryType: 'Buy', message: '' });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    await submitEnquiry({
      ...modalForm,
      enquiryType: 'Property / Project Enquiry',
      context: enquiryContext,
    });
    setModalForm({ name: '', email: '', phone: '', budget: 'Under $5M', message: '' });
    setEnquiryModalOpen(false);
  };

  return (
    <div className="bg-white text-charcoal font-sans antialiased">
      <div className="bg-navy-dark text-stone text-xs border-b border-navy-light py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-6">
            <span>Global Edition</span>
            <div className="hidden md:flex gap-4">
              <span>UAE</span>
              <span>|</span>
              <span>UK</span>
              <span>|</span>
              <span>India</span>
              <span>|</span>
              <span>Singapore</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span>+971 4 000 0000</span>
            <span>enquiries@regalglobal.com</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-md text-white border-b border-navy-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Regal Global International Real Estate"
              className="h-12 sm:h-14 w-auto object-contain mix-blend-screen scale-125"
            />
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            <a href="#home" className="hover:text-gold transition">Home</a>
            <a href="#about" className="hover:text-gold transition">About Us</a>
            <a href="#properties" className="hover:text-gold transition">Properties</a>
            <a href="#destinations" className="hover:text-gold transition">Destinations</a>
            <a href="#projects" className="hover:text-gold transition">Projects</a>
            <a href="#services" className="hover:text-gold transition">Services</a>
            <a href="#insights" className="hover:text-gold transition">Insights</a>
            <a href="#contact" className="hover:text-gold transition">Contact</a>
          </nav>

          <button
            onClick={() => openEnquiry('Private Consultation')}
            className="bg-gold hover:bg-gold-dark text-navy font-semibold px-5 py-2.5 rounded-sm transition text-sm"
          >
            Enquire Now
          </button>
        </div>
      </header>

      <section id="home" className="relative min-h-[82vh] flex items-center justify-center bg-navy text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury International Property"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center py-20">
          <span className="inline-block text-gold text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mb-4 border-b border-gold/40 pb-1">
            Verified International Real Estate
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 text-gold-light">
            Where Global Vision Meets Exceptional Living.
          </h1>
          <p className="text-stone text-base sm:text-xl font-light max-w-3xl mx-auto mb-10">
            Discover extraordinary residences, signature development projects, and strategic international investment opportunities curated across premier global destinations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#properties" className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-navy font-semibold px-8 py-4 rounded-sm transition">
              Explore Properties
            </a>
            <button
              onClick={() => openEnquiry('Private Consultation')}
              className="w-full sm:w-auto border border-gold/60 hover:border-gold text-white hover:bg-gold/10 font-semibold px-8 py-4 rounded-sm transition"
            >
              Speak to an Advisor
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-8 -mt-14 mb-16">
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 border border-stone/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-navy uppercase mb-2">Destination</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2.5 text-sm">
              <option value="All">All Destinations</option>
              <option value="Dubai, UAE">Dubai, UAE</option>
              <option value="London, UK">London, UK</option>
              <option value="Mumbai, India">Mumbai, India</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy uppercase mb-2">Property Type</label>
            <select value={propType} onChange={(e) => setPropType(e.target.value)} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2.5 text-sm">
              <option value="All">All Types</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Villa">Luxury Villa</option>
              <option value="Apartment">Apartment</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy uppercase mb-2">Purpose</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2.5 text-sm">
              <option value="All">Buy or Invest</option>
              <option value="Sale">Buy (For Sale)</option>
              <option value="Rent">Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy uppercase mb-2">Max Price (USD)</label>
            <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2.5 text-sm">
              <option value="999999999">Any Budget</option>
              <option value="5000000">Up to $5,000,000</option>
              <option value="10000000">Up to $10,000,000</option>
              <option value="20000000">Up to $20,000,000</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-navy hover:bg-navy-light text-gold font-bold py-2.5 px-4 rounded transition border border-gold/40">
            Search Properties
          </button>
        </form>
      </section>

      <section id="about" className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
            alt="Luxury Estate Architecture"
            className="rounded-lg shadow-xl w-full object-cover h-[420px]"
          />
          <div className="space-y-5">
            <span className="text-gold font-semibold text-xs tracking-widest uppercase">About Regal Global</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-navy font-bold">More Than Real Estate. A World of Possibilities.</h2>
            <p className="text-charcoal leading-relaxed font-light">
              Regal Global stands as an international real estate authority designed for high-net-worth buyers, investors, and corporate partners across prime residential, commercial, and off-plan developments.
            </p>
            <button onClick={() => openEnquiry('Corporate Introduction')} className="bg-navy text-white hover:bg-navy-light px-6 py-3 rounded-sm text-sm font-semibold transition border border-gold/30">
              Request Corporate Profile
            </button>
          </div>
        </div>
      </section>

      <section id="properties" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-gold font-semibold text-xs tracking-widest uppercase">Handpicked Inventory</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-navy font-bold mt-1">Featured Global Properties</h2>
            </div>
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
              {['All', 'Penthouse', 'Villa', 'Apartment'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                    activeTab === tab ? 'border-gold text-gold' : 'border-transparent text-stone hover:text-navy'
                  }`}
                >
                  {tab === 'All' ? 'All Properties' : `${tab}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProps.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden border border-stone/20 flex flex-col justify-between">
                <div>
                  <div className="relative h-64 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-4 left-4 bg-gold text-navy text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                      {item.type}
                    </span>
                    <span className="absolute bottom-4 left-4 bg-navy/85 text-white text-xs px-2.5 py-1 rounded">
                      {item.destination}
                    </span>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] text-stone font-semibold uppercase">{item.sourceOrg}</span>
                    <h3 className="font-serif text-xl font-bold text-navy mt-1">{item.title}</h3>
                    <p className="text-sm font-bold text-gold mt-2">{item.priceFormatted}</p>
                    <div className="flex justify-between border-t border-b border-stone/20 py-3 mt-4 text-xs text-stone">
                      <span>{item.bedrooms} Beds</span>
                      <span>{item.bathrooms} Baths</span>
                      <span>{item.area}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setSelectedProperty(item)}
                    className="w-full bg-ivory hover:bg-navy hover:text-gold text-navy font-bold py-2.5 rounded transition text-xs uppercase tracking-wider border border-stone/30"
                  >
                    View Full Specifications
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="destinations" className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-gold font-semibold text-xs tracking-widest uppercase">Prime Territories</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-1 text-gold-light">Global Destinations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { city: 'Dubai', filter: 'Dubai, UAE', region: 'United Arab Emirates', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
              { city: 'London', filter: 'London, UK', region: 'United Kingdom', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
              { city: 'Mumbai', filter: 'Mumbai, India', region: 'India', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80' },
              { city: 'Singapore', filter: 'Singapore', region: 'Singapore', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80' },
            ].map((d) => (
              <div
                key={d.city}
                onClick={() => {
                  setDestination(d.filter);
                  applyFilters(d.filter, propType, purpose, maxPrice);
                  document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative rounded-lg overflow-hidden h-80 cursor-pointer border border-navy-light hover:border-gold/50 transition group"
              >
                <img src={d.img} alt={d.city} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <span className="text-gold text-xs font-semibold uppercase">{d.region}</span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1">{d.city}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="mb-12">
            <span className="text-gold font-semibold text-xs tracking-widest uppercase">Developer Collaborations</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-navy font-bold mt-1">Signature Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-stone/20 flex flex-col md:flex-row">
                <img src={proj.image} alt={proj.name} className="md:w-1/2 h-60 md:h-auto object-cover" />
                <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs text-stone font-semibold uppercase">Developer: {proj.developer}</span>
                    <h3 className="font-serif text-xl font-bold text-navy mt-1">{proj.name}</h3>
                    <p className="text-xs text-charcoal mt-2">{proj.description}</p>
                  </div>
                  <div className="text-xs text-stone space-y-1">
                    <div><strong className="text-navy">Location:</strong> {proj.location}</div>
                    <div><strong className="text-navy">Completion:</strong> {proj.completionDate}</div>
                  </div>
                  <button
                    onClick={() => openEnquiry(`Project: ${proj.name}`)}
                    className="bg-navy hover:bg-navy-light text-gold font-bold text-xs py-2.5 px-4 rounded transition uppercase"
                  >
                    Request Brochure & Layouts
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-gold font-semibold text-xs tracking-widest uppercase">Expertise & Solutions</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-navy font-bold mt-1">Our Core Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Residential Brokerage', desc: 'Buying, selling, and leasing high-end residential estates and private penthouses.' },
              { title: 'Property Investment', desc: 'Strategic capital deployment advisory, yield optimization, and cross-border guidance.' },
              { title: 'Development Consultancy', desc: 'Partnership advisory for international developers and global sales strategy.' },
              { title: 'Commercial Real Estate', desc: 'Acquisition and disposition of commercial towers, hospitality assets, and prime plots.' },
            ].map((srv) => (
              <div key={srv.title} className="bg-ivory p-8 rounded border border-stone/20 space-y-3">
                <h3 className="font-serif font-bold text-navy text-xl">{srv.title}</h3>
                <p className="text-xs text-charcoal leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="insights" className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="mb-12">
            <span className="text-gold font-semibold text-xs tracking-widest uppercase">Market Intelligence</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-navy font-bold mt-1">Latest Insights & Reports</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {insights.map((art) => (
              <div key={art.id} className="bg-white rounded overflow-hidden shadow-sm border border-stone/20">
                <img src={art.image} alt={art.title} className="w-full h-48 object-cover" />
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-gold bg-navy px-2 py-0.5 rounded">{art.category}</span>
                  <h3 className="font-serif text-lg font-bold text-navy">{art.title}</h3>
                  <p className="text-xs text-stone">{art.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <span className="text-gold font-semibold text-xs tracking-widest uppercase">Private Consultation</span>
            <h2 className="font-serif text-4xl font-bold text-gold-light">Let’s Find Your Place in the World.</h2>
            <p className="text-stone text-sm font-light">
              Speak with a senior advisor for tailored real estate advice, private property previews, or developer collaboration inquiries.
            </p>
            <div className="space-y-2 text-xs text-stone pt-4 border-t border-navy-light">
              <div><strong className="text-white">HQ:</strong> Regal Global Tower, Level 42, DIFC, Dubai, UAE</div>
              <div><strong className="text-white">Phone:</strong> +971 4 000 0000 | +44 20 0000 0000</div>
              <div><strong className="text-white">Email:</strong> enquiries@regalglobal.com</div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-white rounded-lg p-8 text-charcoal shadow-2xl space-y-4">
            <h3 className="font-serif text-2xl font-bold text-navy">Request Consultation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Full Name *" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2 text-sm" />
              <input required type="email" placeholder="Email Address *" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required type="tel" placeholder="Phone Number *" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2 text-sm" />
              <select value={contactForm.enquiryType} onChange={(e) => setContactForm({ ...contactForm, enquiryType: e.target.value })} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2 text-sm">
                <option value="Buy">Property Purchase</option>
                <option value="Rent">Rental Enquiry</option>
                <option value="Sell/List">Owner / Sell Property</option>
                <option value="Investment">Investment Advisory</option>
                <option value="Developer Partnership">Developer Partnership</option>
              </select>
            </div>
            <textarea required rows="3" placeholder="Message *" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2 text-sm" />
            <button type="submit" className="w-full bg-navy hover:bg-navy-light text-gold font-bold py-3 rounded transition uppercase text-xs tracking-wider border border-gold/40">
              Submit Consultation Request
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-navy-dark text-stone text-xs border-t border-navy-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <img
            src="/logo.svg"
            alt="Regal Global"
            className="h-12 w-auto object-contain mix-blend-screen"
          />
          <p>&copy; 2026 Regal Global Real Estate Company. All rights reserved.</p>
        </div>
      </footer>

      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-navy/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto text-charcoal relative">
            <button onClick={() => setSelectedProperty(null)} className="absolute top-4 right-4 bg-navy text-gold px-3 py-1 rounded text-xs font-bold">
              Close
            </button>
            <img src={selectedProperty.image} alt={selectedProperty.title} className="w-full h-72 object-cover" />
            <div className="p-6 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-navy">{selectedProperty.title}</h2>
              <p className="text-sm font-bold text-gold">{selectedProperty.priceFormatted}</p>
              <p className="text-sm text-charcoal leading-relaxed">{selectedProperty.description}</p>
              <button
                onClick={() => {
                  const title = selectedProperty.title;
                  setSelectedProperty(null);
                  openEnquiry(title);
                }}
                className="bg-gold hover:bg-gold-dark text-navy font-bold px-5 py-2.5 rounded text-xs uppercase"
              >
                Request Private Viewing
              </button>
            </div>
          </div>
        </div>
      )}

      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/80 flex items-center justify-center p-4">
          <form onSubmit={handleModalSubmit} className="bg-white rounded-lg max-w-md w-full p-6 space-y-3 text-charcoal relative">
            <button type="button" onClick={() => setEnquiryModalOpen(false)} className="absolute top-4 right-4 text-xs font-bold text-navy">
              Close
            </button>
            <h3 className="font-serif text-xl font-bold text-navy">Enquire: {enquiryContext}</h3>
            <input required placeholder="Full Name *" value={modalForm.name} onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2 text-xs" />
            <input required type="email" placeholder="Email *" value={modalForm.email} onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2 text-xs" />
            <input required type="tel" placeholder="Phone *" value={modalForm.phone} onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2 text-xs" />
            <textarea rows="3" placeholder="Message" value={modalForm.message} onChange={(e) => setModalForm({ ...modalForm, message: e.target.value })} className="w-full bg-ivory border border-stone/30 rounded px-3 py-2 text-xs" />
            <button type="submit" className="w-full bg-navy text-gold font-bold py-2.5 rounded text-xs uppercase">
              Send Private Enquiry
            </button>
          </form>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-6 py-4 rounded shadow-2xl border border-gold">
          <h4 className="font-bold text-sm text-gold">{toast.title}</h4>
          <p className="text-xs text-stone">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
