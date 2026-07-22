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
const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// Fake user middleware for prototype
const fakeAuth = (req: any, res: any, next: any) => {
  req.user = { id: 'admin-123' };
  next();
};

// 1. Get All Data (Massive Sync)
app.get('/api/sync', fakeAuth, async (req: any, res: any) => {
  try {
    const proposals = await prisma.proposal.findMany({ include: { votes: true, comments: true } });
    const transactions = await prisma.transaction.findMany({ orderBy: { date: 'desc' } });
    const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
    
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

    const formattedLeads = leads.map(l => ({ id: l.id, status: l.status, ...(l.data as any) }));
    const formattedCustomers = customers.map(c => ({ id: c.id, ...(c.data as any) }));
    const formattedTransactions = transactions.map(t => ({ id: t.id, date: t.date.toISOString().split('T')[0], description: t.description, amount: t.amount, status: 'completed' }));
    
    res.json({
      proposals: formattedProposals,
      transactions: formattedTransactions,
      campaigns,
      leads: formattedLeads,
      customers: formattedCustomers,
      messages: [] // Mock messages
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proposals
app.post('/api/proposals', fakeAuth, async (req: any, res: any) => {
  const p = await prisma.proposal.create({
    data: { groupId: 'g1', createdBy: req.user.id, title: req.body.title, description: req.body.description, amount: req.body.amount, status: req.body.status }
  });
  res.json(p);
});
app.put('/api/proposals/:id', fakeAuth, async (req: any, res: any) => {
  const p = await prisma.proposal.update({ where: { id: req.params.id }, data: req.body });
  res.json(p);
});
app.post('/api/proposals/:id/vote', fakeAuth, async (req: any, res: any) => {
  const { choice } = req.body;
  await prisma.vote.create({ data: { proposalId: req.params.id, userId: req.user.id, choice } });
  res.json({ success: true });
});
app.post('/api/proposals/:id/arguments', fakeAuth, async (req: any, res: any) => {
  await prisma.comment.create({ data: { proposalId: req.params.id, userId: req.user.id, body: `ARG:${req.body.type}:${req.body.text}` } });
  res.json({ success: true });
});
app.post('/api/proposals/:id/followups', fakeAuth, async (req: any, res: any) => {
  await prisma.comment.create({ data: { proposalId: req.params.id, userId: req.user.id, body: `FUP:${req.body.text}` } });
  res.json({ success: true });
});

// Campaigns
app.post('/api/campaigns', fakeAuth, async (req: any, res: any) => {
  const c = await prisma.campaign.create({ data: req.body });
  res.json(c);
});

// Leads
app.post('/api/leads/import', fakeAuth, async (req: any, res: any) => {
  await Promise.all(req.body.map((data: any) => prisma.lead.create({ data: { data } })));
  res.json({ success: true });
});
app.put('/api/leads/:id/status', fakeAuth, async (req: any, res: any) => {
  await prisma.lead.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  res.json({ success: true });
});
app.post('/api/leads/bulk-status', fakeAuth, async (req: any, res: any) => {
  await prisma.lead.updateMany({ where: { id: { in: req.body.ids } }, data: { status: req.body.status } });
  res.json({ success: true });
});
app.delete('/api/leads/:id', fakeAuth, async (req: any, res: any) => {
  await prisma.lead.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
app.post('/api/leads/bulk-delete', fakeAuth, async (req: any, res: any) => {
  await prisma.lead.deleteMany({ where: { id: { in: req.body.ids } } });
  res.json({ success: true });
});

// Customers
app.post('/api/customers/import', fakeAuth, async (req: any, res: any) => {
  await Promise.all(req.body.map((data: any) => prisma.customer.create({ data: { data } })));
  res.json({ success: true });
});
app.delete('/api/customers/:id', fakeAuth, async (req: any, res: any) => {
  await prisma.customer.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
app.post('/api/customers/bulk-delete', fakeAuth, async (req: any, res: any) => {
  await prisma.customer.deleteMany({ where: { id: { in: req.body.ids } } });
  res.json({ success: true });
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
