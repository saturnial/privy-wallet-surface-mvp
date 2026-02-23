import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  walletAddress: text('wallet_address').notNull().default(''),
  displayName: text('display_name').notNull(),
  balanceCents: integer('balance_cents').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'send' | 'receive'
  amountCents: integer('amount_cents').notNull(),
  counterpartyLabel: text('counterparty_label').notNull(),
  txHash: text('tx_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cryptoTransactions = pgTable('crypto_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'send' | 'receive'
  asset: text('asset').notNull(), // 'ETH' | 'USDC'
  amount: text('amount').notNull(),
  address: text('address').notNull(),
  txHash: text('tx_hash').notNull(),
  network: text('network').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const recipients = pgTable('recipients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nickname: text('nickname').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
