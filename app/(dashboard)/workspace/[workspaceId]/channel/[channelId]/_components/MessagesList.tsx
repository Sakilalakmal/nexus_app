import { MessageItem } from "./Messages/MessageItem";

const messages = [
  {
    id: 1,
    messages: "hello how are you?",
    date: new Date(),
    avatar: "https://avatars.githubusercontent.com/u/164737611?v=4&size=64",
    username: "Sakila lakmal",
  },
];

export function MessagesList() {
  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-4">
        {messages.map((messag) => (
          <MessageItem key={messag.id} {...messag} />
        ))}
      </div>
    </div>
  );
}
