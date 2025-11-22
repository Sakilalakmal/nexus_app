import { generateCompose, generateThreadSummary } from "./ai";
import { createChannel, getChannel, listChannels } from "./channel";
import { inviteMember, listMembers } from "./Invite-member";
import {
  createMessage,
  listMessages,
  toggleMessageReaction,
  updateMessage,
} from "./message";
import { createWorkspaces, listReplies, listWorkspaces } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspaces,
    member: {
      invite: inviteMember,
      list: listMembers,
    },
  },

  channel: {
    create: createChannel,
    list: listChannels,
    get: getChannel,
  },

  message: {
    create: createMessage,
    list: listMessages,
    update: updateMessage,
    reaction: {
      toggle: toggleMessageReaction,
    },
    thread: {
      list: listReplies,
    },
  },
  ai: {
    compose: {
      generate: generateCompose,
    },
    threads: {
      summary: {
        generate: generateThreadSummary,
      },
    },
  },
};
