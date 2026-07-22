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

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 1. Register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create Group / Organization
app.post('/api/groups', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, description } = req.body;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const group = await prisma.group.create({
      data: {
        name,
        description,
        inviteCode,
        createdBy: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'Super Admin'
          }
        }
      }
    });
    res.json(group);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Invite User to Group
app.post('/api/groups/:id/invite', authenticateToken, async (req: any, res: any) => {
  try {
    const groupId = req.params.id;
    const { email, role } = req.body;
    
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.user.id } }
    });
    if (!member || !['Super Admin', 'Admin'].includes(member.role)) {
      return res.status(403).json({ error: 'Not authorized to invite' });
    }

    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.groupInvite.create({
      data: { groupId, email, role: role || 'Member', token, expiresAt }
    });

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'invites@glimmerfall.com',
        to: email,
        subject: 'You have been invited to join a group on GlimmerFall',
        html: `<p>Click here to join: <a href="http://localhost:5173/join?token=${token}">Join Group</a></p>`
      });
    }

    res.json(invite);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Generic Import (Orders, Customers, Leads)
app.post('/api/import', authenticateToken, async (req: any, res: any) => {
  try {
    const { type, records } = req.body;
    const created = await Promise.all(
      records.map((data: any) => 
        prisma.importedRecord.create({
          data: { type, data }
        })
      )
    );
    res.json({ success: true, count: created.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Create Proposal (Förslag)
app.post('/api/groups/:id/proposals', authenticateToken, async (req: any, res: any) => {
  try {
    const groupId = req.params.id;
    const { title, title_sv, description, description_sv } = req.body;
    
    const proposal = await prisma.proposal.create({
      data: {
        groupId,
        createdBy: req.user.id,
        title,
        title_sv,
        description,
        description_sv,
        status: 'active'
      }
    });
    res.json(proposal);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Vote on Proposal
app.post('/api/proposals/:id/vote', authenticateToken, async (req: any, res: any) => {
  try {
    const proposalId = req.params.id;
    const { choice } = req.body; // 'for', 'against', 'abstain'

    const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
    if (!proposal) return res.status(404).json({ error: 'Not found' });

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: proposal.groupId, userId: req.user.id } }
    });
    if (!member) return res.status(403).json({ error: 'Not a member' });

    const vote = await prisma.vote.upsert({
      where: { proposalId_userId: { proposalId, userId: req.user.id } },
      update: { choice },
      create: { proposalId, userId: req.user.id, choice }
    });

    // Check majority for 'for' votes
    const allVotes = await prisma.vote.findMany({ where: { proposalId } });
    const totalMembers = await prisma.groupMember.count({ where: { groupId: proposal.groupId } });
    const forVotes = allVotes.filter(v => v.choice === 'for').length;
    
    // If strictly more than half the group voted yes, it passes
    if (forVotes > totalMembers / 2) {
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'approved', resolvedAt: new Date() }
      });
    }

    res.json(vote);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
