import { getDb, id, now } from "./db";
import type { ChatMessage, Conversation } from "@shared/types";

export function listConversations(): Conversation[] {
  return getDb()
    .prepare("select id, title, created_at as createdAt, updated_at as updatedAt from conversations order by updated_at desc")
    .all() as Conversation[];
}

export function createConversation(): Conversation {
  const conversation: Conversation = { id: id(), title: "New chat", createdAt: now(), updatedAt: now() };
  getDb().prepare("insert into conversations (id, title, created_at, updated_at) values (?, ?, ?, ?)").run(
    conversation.id,
    conversation.title,
    conversation.createdAt,
    conversation.updatedAt,
  );
  return conversation;
}

export function deleteConversation(conversationId: string) {
  getDb().prepare("delete from conversations where id = ?").run(conversationId);
}

export function listMessages(conversationId: string): ChatMessage[] {
  return getDb()
    .prepare(
      "select id, conversation_id as conversationId, role, content, created_at as createdAt from messages where conversation_id = ? order by created_at",
    )
    .all(conversationId) as ChatMessage[];
}

export function addMessage(conversationId: string, role: "user" | "assistant", content: string): ChatMessage {
  const message: ChatMessage = { id: id(), conversationId, role, content, createdAt: now() };
  getDb().prepare("insert into messages (id, conversation_id, role, content, created_at) values (?, ?, ?, ?, ?)").run(
    message.id,
    conversationId,
    role,
    content,
    message.createdAt,
  );
  getDb().prepare("update conversations set updated_at = ? where id = ?").run(message.createdAt, conversationId);
  const conv = getDb().prepare("select title from conversations where id = ?").get(conversationId) as { title: string } | undefined;
  if (conv?.title === "New chat" && role === "user") {
    getDb().prepare("update conversations set title = ? where id = ?").run(content.slice(0, 40), conversationId);
  }
  return message;
}

export function listMemories() {
  return getDb()
    .prepare("select id, content, created_at as createdAt from memories order by created_at desc")
    .all() as { id: string; content: string; createdAt: number }[];
}

export function deleteMemory(memoryId: string) {
  getDb().prepare("delete from memories where id = ?").run(memoryId);
}

export function addMemory(content: string) {
  const item = { id: id(), content: content.trim().slice(0, 500), createdAt: now() };
  getDb().prepare("insert into memories (id, content, created_at) values (?, ?, ?)").run(item.id, item.content, item.createdAt);
  return item;
}
