import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// Fake user middleware for prototype
const fakeAuth = (req: any, res: any, next: any) => {
  req.user = { id: 'admin-123' };
  next();
};

const ensureSeedData = async () => {
  try {
    const user = await prisma.user.upsert({
      where: { id: 'admin-123' },
      update: {},
      create: { id: 'admin-123', email: 'admin@samstyre.com', passwordHash: 'hash', name: 'Admin' }
    });
    const group = await prisma.group.upsert({
      where: { id: 'g1' },
      update: {},
      create: { id: 'g1', name: 'Main Group', inviteCode: 'invite-123', createdBy: 'admin-123' }
    });
    console.log('Seed data verified');
  } catch (err) {
    console.error('Seed data error:', err);
  }
};
// ensureSeedData();

// Health check
app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Get All Data (Massive Sync)
app.get('/api/sync', fakeAuth, async (req: any, res: any) => {
  try {
    const proposals = await prisma.proposal.findMany({ include: { votes: true, comments: true } });
    const transactions = await prisma.transaction.findMany({ orderBy: { date: 'desc' } });
    const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
    const ordersDb = await prisma.importedRecord.findMany({ where: { type: 'Order' }, orderBy: { createdAt: 'desc' } });
    
    // Transform proposals to match frontend interface
    const formattedProposals = proposals.map(p => {
      const forVotes = p.votes.filter(v => v.choice === 'for').length;
      const againstVotes = p.votes.filter(v => v.choice === 'against').length;
      const abstainVotes = p.votes.filter(v => v.choice === 'abstain').length;

      const args = p.comments.filter(c => c.body.startsWith('ARG:')).map(c => {
        const parts = c.body.split(':');
        return { id: c.id, type: parts[1], text: parts.slice(2).join(':'), author: 'Admin' };
      });

      const followUps = p.comments.filter(c => c.body.startsWith('FUP:')).map(c => {
        return { id: c.id, text: c.body.substring(4), author: 'Admin', date: c.createdAt.toISOString() };
      });

      return {
        id: p.id,
        title: p.title,
        description: p.description || '',
        amount: p.amount || 0,
        status: p.status,
        votes: { for: forVotes, against: againstVotes, abstain: abstainVotes },
        totalMembers: 5,
        userVote: p.votes.find(v => v.userId === req.user.id)?.choice || null,
        arguments: args,
        followUps: followUps
      };
    });

    const formattedLeads = leads.map(l => {
      const dataObj = typeof l.data === 'object' && l.data !== null ? { ...(l.data as any) } : {};
      delete dataObj.id;
      return { ...dataObj, id: l.id, status: l.status };
    });
    const formattedCustomers = customers.map(c => {
      const dataObj = typeof c.data === 'object' && c.data !== null ? { ...(c.data as any) } : {};
      delete dataObj.id;
      return { ...dataObj, id: c.id };
    });
    const formattedOrders = ordersDb.map(o => {
      const dataObj = typeof o.data === 'object' && o.data !== null ? { ...(o.data as any) } : {};
      delete dataObj.id;
      return { ...dataObj, id: o.id, status: dataObj.status || 'pending' };
    });
    const formattedTransactions = transactions.map(t => ({ id: t.id, date: t.date.toISOString().split('T')[0], description: t.description, amount: t.amount, status: 'completed' }));
    
    res.json({
      proposals: formattedProposals,
      transactions: formattedTransactions,
      campaigns,
      leads: formattedLeads,
      customers: formattedCustomers,
      orders: formattedOrders,
      messages: [] // Mock messages
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proposals
app.post('/api/proposals', fakeAuth, async (req: any, res: any) => {
  try {
    const p = await prisma.proposal.create({
      data: { groupId: 'g1', createdBy: req.user.id, title: req.body.title, description: req.body.description, amount: req.body.amount, status: req.body.status }
    });
    res.json(p);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
app.put('/api/proposals/:id', fakeAuth, async (req: any, res: any) => {
  try {
    const p = await prisma.proposal.update({ where: { id: req.params.id }, data: req.body });
    res.json(p);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
app.post('/api/proposals/:id/vote', fakeAuth, async (req: any, res: any) => {
  try {
    const { choice } = req.body;
    await prisma.vote.create({ data: { proposalId: req.params.id, userId: req.user.id, choice } });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
app.post('/api/proposals/:id/arguments', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.comment.create({ data: { proposalId: req.params.id, userId: req.user.id, body: `ARG:${req.body.type}:${req.body.text}` } });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
app.post('/api/proposals/:id/followups', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.comment.create({ data: { proposalId: req.params.id, userId: req.user.id, body: `FUP:${req.body.text}` } });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Transactions
app.post('/api/transactions', fakeAuth, async (req: any, res: any) => {
  try {
    const t = await prisma.transaction.create({ 
      data: { 
        groupId: 'g1', 
        createdBy: req.user.id, 
        date: new Date(req.body.date), 
        description: req.body.description, 
        amount: req.body.amount, 
        type: req.body.amount > 0 ? 'income' : 'expense' 
      } 
    });
    res.json(t);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Campaigns
app.post('/api/campaigns', fakeAuth, async (req: any, res: any) => {
  try {
    const c = await prisma.campaign.create({ data: req.body });
    res.json(c);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Calculations
app.get('/api/calculations', fakeAuth, async (req: any, res: any) => {
  try {
    const calcs = await prisma.calculation.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(calcs);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/calculations', fakeAuth, async (req: any, res: any) => {
  try {
    const calc = await prisma.calculation.create({ data: req.body });
    res.json(calc);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Leads
app.post('/api/leads/import', fakeAuth, async (req: any, res: any) => {
  try {
    await Promise.all(req.body.map((data: any) => prisma.lead.create({ data: { data } })));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/leads/:id/status', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.lead.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/leads/bulk-status', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.lead.updateMany({ where: { id: { in: req.body.ids } }, data: { status: req.body.status } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/leads/:id', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/leads/bulk-delete', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.lead.deleteMany({ where: { id: { in: req.body.ids } } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customers
app.post('/api/customers/import', fakeAuth, async (req: any, res: any) => {
  try {
    await Promise.all(req.body.map((data: any) => prisma.customer.create({ data: { data } })));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/customers/:id', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
app.post('/api/customers/bulk-delete', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.customer.deleteMany({ where: { id: { in: req.body.ids } } });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Orders
app.post('/api/orders/import', fakeAuth, async (req: any, res: any) => {
  try {
    await Promise.all(req.body.map((data: any) => prisma.importedRecord.create({ data: { type: 'Order', data } })));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/orders/:id/status', fakeAuth, async (req: any, res: any) => {
  try {
    const record = await prisma.importedRecord.findUnique({ where: { id: req.params.id } });
    if (!record) throw new Error("Not found");
    const data = record.data as any;
    data.status = req.body.status;
    await prisma.importedRecord.update({ where: { id: req.params.id }, data: { data } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/orders/bulk-status', fakeAuth, async (req: any, res: any) => {
  try {
    const records = await prisma.importedRecord.findMany({ where: { id: { in: req.body.ids } } });
    await Promise.all(records.map(async r => {
      const data = r.data as any;
      data.status = req.body.status;
      return prisma.importedRecord.update({ where: { id: r.id }, data: { data } });
    }));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/orders/:id', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.importedRecord.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
app.post('/api/orders/bulk-delete', fakeAuth, async (req: any, res: any) => {
  try {
    await prisma.importedRecord.deleteMany({ where: { id: { in: req.body.ids } } });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Resend
app.post('/api/send-invite-test', async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'You have been invited to join SamStyre',
      html: `<p>Welcome to SamStyre! Click here to accept your invitation.</p>`
    });
    if (result.error) return res.status(400).json({ error: result.error.message });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
