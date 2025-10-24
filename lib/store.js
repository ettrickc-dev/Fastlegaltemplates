// lib/store.js
const drafts = new Map(); // id -> draft data
const files = new Map();  // token -> { buffer, filename, mime, expiresAt }

export const Store = {
  saveDraft(d) { drafts.set(d.id, d); },
  getDraft(id) { return drafts.get(id); },

  saveFile(token, obj) { files.set(token, obj); },
  getFile(token) {
    const f = files.get(token);
    if (!f) return null;
    if (f.expiresAt && Date.now() > f.expiresAt) {
      files.delete(token);
      return null;
    }
    return f;
  }
};
