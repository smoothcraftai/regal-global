import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const { PrismaClient } = pkg;

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Set it in the backend environment or Render service settings.');
}
const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required. Set it in the backend environment or Render service settings.');
}

const isLocalDb =
  databaseUrl.includes('localhost') ||
  databaseUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: databaseUrl,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err.message);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const JWT_SECRET = jwtSecret;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes('*') || allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  })
);
app.use(express.json());

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please try again shortly.' },
});

const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await prisma.adminUser.findUnique({ where: { id: decoded.id } });
    if (!admin || !admin.active) {
      return res.status(403).json({ error: 'Account inactive or invalid' });
    }
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
};

// Health check for Render
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error('Healthcheck DB error:', err.message);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Public endpoints
app.get('/api/v1/public/bootstrap', async (req, res) => {
  try {
    const [properties, projects, insights] = await Promise.all([
      prisma.property.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' } }),
      prisma.project.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' } }),
      prisma.insight.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' } }),
    ]);
    res.json({ properties, projects, insights });
  } catch (err) {
    console.error('Bootstrap error:', err);
    res.status(500).json({ error: 'Failed to load bootstrap data', details: err.message });
  }
});

app.post('/api/v1/public/enquiries', strictLimiter, async (req, res) => {
  try {
    const { name, email, phone, enquiryType, context, budget, message } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }
    const referenceId = 'LEAD-' + Math.floor(1000 + Math.random() * 9000);
    const lead = await prisma.lead.create({
      data: {
        referenceId,
        name,
        email,
        phone,
        enquiryType: enquiryType || 'General Enquiry',
        context: context || 'Website Enquiry',
        budget: budget || null,
        message: message || '',
        status: 'NEW',
      },
    });
    res.status(201).json({ success: true, referenceId: lead.referenceId, message: 'Enquiry logged successfully.' });
  } catch (err) {
    console.error('Enquiry error:', err);
    res.status(500).json({ error: 'Failed to submit enquiry.' });
  }
});

// Hidden admin login
app.post('/api/v1/auth/admin-login', strictLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.active || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '12h' });
    await prisma.auditLog.create({
      data: { adminId: admin.id, action: 'LOGIN', entity: 'AdminUser', details: 'Admin logged into portal' },
    });
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected admin endpoints
app.get('/api/v1/admin/overview', requireAdmin, async (req, res) => {
  try {
    const [leads, properties, projects, insights, auditLogs] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.property.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.project.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.insight.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.findMany({
        include: { admin: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);
    res.json({ leads, properties, projects, insights, auditLogs });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Failed to load admin overview' });
  }
});

app.patch('/api/v1/admin/leads/:id', requireAdmin, async (req, res) => {
  try {
    const { status, internalNote, followUpDate } = req.body;
    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(internalNote !== undefined && { internalNote }),
        ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
      },
    });
    await prisma.auditLog.create({
      data: { adminId: req.admin.id, action: 'UPDATE_LEAD', entity: updated.referenceId, details: `Updated status to ${updated.status}` },
    });
    res.json(updated);
  } catch (err) {
    console.error('Update lead error:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

app.post('/api/v1/admin/properties', requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const referenceCode = 'PROP-' + Math.floor(100 + Math.random() * 900);
    const property = await prisma.property.create({
      data: {
        referenceCode,
        title: data.title,
        slug,
        destination: data.destination,
        type: data.type,
        purpose: data.purpose,
        priceUSD: parseFloat(data.priceUSD),
        priceFormatted: data.priceFormatted,
        bedrooms: parseInt(data.bedrooms, 10),
        bathrooms: parseInt(data.bathrooms, 10),
        area: data.area,
        image: data.image,
        description: data.description,
        sourceType: data.sourceType || 'OWN',
        sourceOrg: data.sourceOrg || 'Regal Global Master',
        status: data.status || 'PUBLISHED',
      },
    });
    await prisma.auditLog.create({
      data: { adminId: req.admin.id, action: 'CREATE_PROPERTY', entity: property.referenceCode, details: `Created property: ${property.title}` },
    });
    res.status(201).json(property);
  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

app.patch('/api/v1/admin/properties/:id/status', requireAdmin, async (req, res) => {
  try {
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(property);
  } catch (err) {
    console.error('Update property status error:', err);
    res.status(500).json({ error: 'Failed to update property status' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Regal Global API running on port ${PORT}`));