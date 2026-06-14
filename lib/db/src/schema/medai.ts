import { pgTable, text, uuid, timestamp, integer, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicalProfiles = pgTable("medical_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  age: integer("age"),
  gender: text("gender"),
  weightKg: numeric("weight_kg"),
  heightCm: numeric("height_cm"),
  bloodType: text("blood_type"),
  chronicConditions: text("chronic_conditions"),
  allergies: text("allergies"),
  currentMedications: text("current_medications"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const symptomHistory = pgTable("symptom_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  symptoms: jsonb("symptoms"),
  result: jsonb("result"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatHistory = pgTable("chat_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  sessionId: text("session_id"),
  role: text("role").notNull(),
  content: text("content").notNull(),
  language: text("language"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userActions = pgTable("user_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  userName: text("user_name"),
  functionName: text("function_name").notNull(),
  actionData: jsonb("action_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suggestions = pgTable("suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email"),
  category: text("category"),
  suggestion: text("suggestion").notNull(),
  suggestionEn: text("suggestion_en"),
  suggestionRu: text("suggestion_ru"),
  suggestionKk: text("suggestion_kk"),
  suggestionZh: text("suggestion_zh"),
  originalLang: text("original_lang"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suggestionLikes = pgTable("suggestion_likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  suggestionId: uuid("suggestion_id").notNull(),
  visitorId: text("visitor_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suggestionReplies = pgTable("suggestion_replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  suggestionId: uuid("suggestion_id").notNull(),
  replyText: text("reply_text").notNull(),
  authorName: text("author_name"),
  isCreator: boolean("is_creator").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPremium = pgTable("user_premium", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  active: boolean("active").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiUsage = pgTable("ai_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitorId: text("visitor_id").notNull(),
  functionName: text("function_name").notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMedicalProfileSchema = createInsertSchema(medicalProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSuggestionSchema = createInsertSchema(suggestions).omit({ id: true, createdAt: true });
export const insertSuggestionLikeSchema = createInsertSchema(suggestionLikes).omit({ id: true, createdAt: true });
export const insertSuggestionReplySchema = createInsertSchema(suggestionReplies).omit({ id: true, createdAt: true });

export type MedicalProfile = typeof medicalProfiles.$inferSelect;
export type SuggestionRow = typeof suggestions.$inferSelect;
export type SuggestionReply = typeof suggestionReplies.$inferSelect;
