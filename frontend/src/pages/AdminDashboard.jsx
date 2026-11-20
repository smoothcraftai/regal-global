import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('leads');
  const [data, setData] = useState({
    leads: [],
    properties: [],
    projects: [],
    insights: [],
    auditLogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const [newProp, setNewProp] = useState({
    title: '',
    destination: 'Dubai, UAE',
    type: 'Penthouse',
    purpose: 'Sale',
    priceUSD: '',
    priceFormatted: '',
    bedrooms: 4,
    bathrooms: 4,
    area: '5,000 Sq.Ft',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: '',
    sourceType: 'OWN',
    sourceOrg: 'Regal Global Master',
    status: 'PUBLISHED',
  });

  const token = localStorage.getItem('rg_admin_token');
  const adminUser = JSON.parse(localStorage.getItem('rg_admin_user') || '{"name":"Admin","role":"SUPER_ADMIN"}');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('rg_admin_token');
        localStorage.removeItem('rg_admin_user');
        navigate('/rg-portal-9x');
        return;
      }
      const overview = await res.json();
      setData(overview);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rg_admin_token');
    localStorage.removeItem('rg_admin_user');
    navigate('/rg-portal-9x');
  };

  const handleLeadStatusChange = async (leadId, status) => {
    await fetch(`${API_BASE}/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status }),
    });
    setStatusMessage(`Lead status updated to ${status}`);
    fetchOverview();
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/admin/properties`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newProp),
    });
    if (res.ok) {
      setStatusMessage('New property listing saved to PostgreSQL.');
      setNewProp({
        ...newProp,
        title: '',
        priceUSD: '',
        priceFormatted: '',
        description: '',
      });
      fetchOverview();
    }
  };

  const handleTogglePropertyStatus = async (propId, nextStatus) => {
    await fetch(`${API_BASE}/admin/properties/${propId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: nextStatus }),
    });
    setStatusMessage(`Property moved to ${nextStatus}`);
    fetchOverview();
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal font-sans">
      {/* Top Bar */}
      <header className="bg-navy text-white border-b border-navy-light px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo.svg"
            alt="Regal Global"
            className="h-10 w-auto object-contain mix-blend-screen"
          />
          <div>
            <span className="text-[10px] tracking-[0.2em] text-gold uppercase font-bold block">
              Hidden Admin & CRM
            </span>
            <h1 className="font-serif text-lg font-bold">Regal Global Operations</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-stone">
            {adminUser.name} ({adminUser.role})
          </span>
          <button
            onClick={handleLogout}
            className="bg-navy-light hover:bg-gold hover:text-navy text-gold border border-gold/40 px-4 py-2 rounded font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {statusMessage && (
          <div className="bg-navy text-gold px-4 py-3 rounded text-xs font-semibold flex justify-between items-center">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className="text-stone hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-stone/20 shadow-sm">
            <span className="text-[11px] uppercase font-bold text-stone">Total Leads</span>
            <p className="font-serif text-3xl font-bold text-navy mt-1">{data.leads.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-stone/20 shadow-sm">
            <span className="text-[11px] uppercase font-bold text-stone">Properties</span>
            <p className="font-serif text-3xl font-bold text-navy mt-1">{data.properties.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-stone/20 shadow-sm">
            <span className="text-[11px] uppercase font-bold text-stone">Signature Projects</span>
            <p className="font-serif text-3xl font-bold text-navy mt-1">{data.projects.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-stone/20 shadow-sm">
            <span className="text-[11px] uppercase font-bold text-stone">Audit Events</span>
            <p className="font-serif text-3xl font-bold text-gold-dark mt-1">{data.auditLogs.length}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-stone/30 pb-3">
          {[
            { id: 'leads', label: 'Inquiries & CRM' },
            { id: 'properties', label: 'Property Inventory' },
            { id: 'audit', label: 'Security & Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition ${
                activeTab === tab.id
                  ? 'bg-navy text-gold border border-gold/40'
                  : 'bg-white text-navy hover:bg-ivory-dark border border-stone/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-lg text-center text-sm text-stone">
            Loading live database records...
          </div>
        ) : (
          <>
            {/* Leads Tab */}
            {activeTab === 'leads' && (
              <div className="bg-white rounded-lg border border-stone/20 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy text-gold uppercase">
                    <tr>
                      <th className="p-3">Ref</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Context</th>
                      <th className="p-3">Message</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone/20">
                    {data.leads.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-stone">
                          No enquiries yet. Submit a test enquiry on the public page to see it appear here.
                        </td>
                      </tr>
                    ) : (
                      data.leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-ivory/60">
                          <td className="p-3 font-bold text-navy">{lead.referenceId}</td>
                          <td className="p-3 font-semibold">{lead.name}</td>
                          <td className="p-3 text-stone">
                            <div>{lead.email}</div>
                            <div>{lead.phone}</div>
                          </td>
                          <td className="p-3">{lead.context}</td>
                          <td className="p-3 max-w-xs truncate">{lead.message}</td>
                          <td className="p-3">
                            <select
                              value={lead.status}
                              onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                              className="bg-ivory border border-stone/30 rounded px-2 py-1 font-semibold text-navy"
                            >
                              {['NEW', 'CONTACTED', 'QUALIFIED', 'IN_DISCUSSION', 'CONVERTED', 'LOST'].map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                  onSubmit={handleCreateProperty}
                  className="bg-white p-6 rounded-lg border border-stone/20 shadow-sm space-y-3 text-xs"
                >
                  <h2 className="font-serif text-lg font-bold text-navy">Add Property Listing</h2>
                  <input
                    required
                    placeholder="Property Title *"
                    value={newProp.title}
                    onChange={(e) => setNewProp({ ...newProp, title: e.target.value })}
                    className="w-full bg-ivory border border-stone/30 rounded px-3 py-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newProp.destination}
                      onChange={(e) => setNewProp({ ...newProp, destination: e.target.value })}
                      className="bg-ivory border border-stone/30 rounded px-3 py-2"
                    >
                      <option value="Dubai, UAE">Dubai, UAE</option>
                      <option value="London, UK">London, UK</option>
                      <option value="Mumbai, India">Mumbai, India</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                    <select
                      value={newProp.type}
                      onChange={(e) => setNewProp({ ...newProp, type: e.target.value })}
                      className="bg-ivory border border-stone/30 rounded px-3 py-2"
                    >
                      <option value="Penthouse">Penthouse</option>
                      <option value="Villa">Villa</option>
                      <option value="Apartment">Apartment</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      type="number"
                      placeholder="Price USD (e.g. 12000000) *"
                      value={newProp.priceUSD}
                      onChange={(e) => setNewProp({ ...newProp, priceUSD: e.target.value })}
                      className="bg-ivory border border-stone/30 rounded px-3 py-2"
                    />
                    <input
                      required
                      placeholder="Display Price *"
                      value={newProp.priceFormatted}
                      onChange={(e) => setNewProp({ ...newProp, priceFormatted: e.target.value })}
                      className="bg-ivory border border-stone/30 rounded px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Beds"
                      value={newProp.bedrooms}
                      onChange={(e) => setNewProp({ ...newProp, bedrooms: e.target.value })}
                      className="bg-ivory border border-stone/30 rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Baths"
                      value={newProp.bathrooms}
                      onChange={(e) => setNewProp({ ...newProp, bathrooms: e.target.value })}
                      className="bg-ivory border border-stone/30 rounded px-3 py-2"
                    />
                    <input
                      placeholder="Area"
                      value={newProp.area}
                      onChange={(e) => setNewProp({ ...newProp, area: e.target.value })}
                      className="bg-ivory border border-stone/30 rounded px-3 py-2"
                    />
                  </div>
                  <input
                    placeholder="Image URL"
                    value={newProp.image}
                    onChange={(e) => setNewProp({ ...newProp, image: e.target.value })}
                    className="w-full bg-ivory border border-stone/30 rounded px-3 py-2"
                  />
                  <textarea
                    required
                    rows="3"
                    placeholder="Description *"
                    value={newProp.description}
                    onChange={(e) => setNewProp({ ...newProp, description: e.target.value })}
                    className="w-full bg-ivory border border-stone/30 rounded px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="w-full bg-navy hover:bg-navy-light text-gold font-bold py-2.5 rounded uppercase tracking-wider border border-gold/40"
                  >
                    Publish Property
                  </button>
                </form>

                <div className="lg:col-span-2 bg-white rounded-lg border border-stone/20 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy text-gold uppercase">
                      <tr>
                        <th className="p-3">Code</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Destination</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone/20">
                      {data.properties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-ivory/60">
                          <td className="p-3 font-bold text-navy">{prop.referenceCode}</td>
                          <td className="p-3 font-semibold">{prop.title}</td>
                          <td className="p-3 text-stone">{prop.destination}</td>
                          <td className="p-3 font-semibold">{prop.status}</td>
                          <td className="p-3">
                            <button
                              onClick={() =>
                                handleTogglePropertyStatus(
                                  prop.id,
                                  prop.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED'
                                )
                              }
                              className="px-2.5 py-1 rounded bg-ivory border border-stone/30 hover:bg-navy hover:text-gold font-semibold"
                            >
                              {prop.status === 'PUBLISHED' ? 'Archive' : 'Publish'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div className="bg-white rounded-lg border border-stone/20 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy text-gold uppercase">
                    <tr>
                      <th className="p-3">Action</th>
                      <th className="p-3">Entity</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone/20">
                    {data.auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-ivory/60">
                        <td className="p-3 font-bold text-navy">{log.action}</td>
                        <td className="p-3 font-semibold">{log.entity}</td>
                        <td className="p-3 text-stone">{log.details}</td>
                        <td className="p-3 text-stone">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}