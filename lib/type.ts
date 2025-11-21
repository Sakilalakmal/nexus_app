import { GroupedReactionsSchemaType } from "@/app/schemas/messages";
import { Message } from "@prisma/client";

export type MessageListItem = Message & {
  repliesCount: number;
  reactions: GroupedReactionsSchemaType[];
};
