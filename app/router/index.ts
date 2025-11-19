import { createChannel, getChannel, listChannels } from "./channel";
import { inviteMember, listMembers } from "./Invite-member";
import { createMessage, listMessages } from "./message";
import { createWorkspaces, listWorkspaces } from "./workspace";

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
  },
};
