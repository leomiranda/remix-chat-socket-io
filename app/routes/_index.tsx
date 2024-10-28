import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
	ArrowLeft,
	MoreVertical,
	Paperclip,
	Search,
	Send,
	Smile,
	LogOut,
} from 'lucide-react';
import { useSocket } from '~/context';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { Form } from '@remix-run/react';

type Chat = {
	id: number;
	name: string;
	lastMessage: string;
	time: string;
	unread: number;
};

type Message = {
	id: number;
	sender: string;
	content: string;
	time: string;
};

const chats = [
	{
		id: 1,
		name: 'Alice',
		lastMessage: 'Hey, how are you?',
		time: '10:30 AM',
		unread: 2,
	},
	{
		id: 2,
		name: 'Bob',
		lastMessage: 'Can we meet tomorrow?',
		time: '9:45 AM',
		unread: 0,
	},
	{
		id: 3,
		name: 'Charlie',
		lastMessage: 'Sure, no problem!',
		time: 'Yesterday',
		unread: 0,
	},
	{
		id: 4,
		name: 'David',
		lastMessage: 'Did you see the game last night?',
		time: 'Yesterday',
		unread: 1,
	},
];

// const messages = [
// 	{ id: 1, sender: 'Alice', content: 'Hey, how are you?', time: '10:30 AM' },
// 	{
// 		id: 2,
// 		sender: 'You',
// 		content: "I'm good, thanks! How about you?",
// 		time: '10:31 AM',
// 	},
// 	{
// 		id: 3,
// 		sender: 'Alice',
// 		content: "I'm doing well too. Any plans for the weekend?",
// 		time: '10:32 AM',
// 	},
// 	{
// 		id: 4,
// 		sender: 'You',
// 		content: 'Not yet. Maybe we could grab coffee?',
// 		time: '10:33 AM',
// 	},
// 	{
// 		id: 5,
// 		sender: 'Alice',
// 		content: 'Sounds great! How about Saturday afternoon?',
// 		time: '10:34 AM',
// 	},
// ];

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	return json({ userId });
}

export default function Index() {
	const socket = useSocket();
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState('');

	useEffect(() => {
		if (!socket) return;

		socket.on('receiveMessage', (message) => {
			setMessages((prevMessages) => [...prevMessages, message]);
		});

		return () => {
			socket.off('receiveMessage');
		};
	}, [socket]);

	const handleSendMessage = () => {
		if (newMessage.trim() === '') return;

		const message = {
			id: Date.now(),
			sender: 'You',
			content: newMessage,
			time: new Date().toLocaleTimeString(),
		};

		setMessages((prevMessages) => [...prevMessages, message]);
		socket?.emit('sendMessage', message);
		setNewMessage('');
	};

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar */}
			<div className="w-full sm:w-80 bg-white border-r">
				<div className="p-4 bg-gray-200 flex justify-between items-center">
					<Avatar>
						<AvatarImage
							src={`https://ui-avatars.com/api/?name=User&background=random&size=40`}
							alt="Your avatar"
						/>
						<AvatarFallback>YA</AvatarFallback>
					</Avatar>
					<div className="flex space-x-2">
						<Form method="POST" action="/logout">
							<Button variant="ghost" size="icon" type="submit">
								<LogOut className="h-5 w-5" />
							</Button>
						</Form>
						<Button variant="ghost" size="icon">
							<MoreVertical className="h-5 w-5" />
						</Button>
					</div>
				</div>
				<div className="p-2">
					<div className="relative">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Search or start new chat" className="pl-8" />
					</div>
				</div>
				<ScrollArea className="h-[calc(100vh-120px)]">
					{chats.map((chat) => (
						<div
							key={chat.id}
							className="flex items-center space-x-4 p-4 hover:bg-gray-100 cursor-pointer"
							onClick={() => setSelectedChat(chat)}
							onKeyDown={(e) => e.key === 'Enter' && setSelectedChat(chat)}
							tabIndex={0}
							role="button"
							aria-label={`Chat with ${chat.name}`}
						>
							<Avatar>
								<AvatarImage
									src={`https://ui-avatars.com/api/?name=${chat.name}&background=random&size=40`}
									alt={chat.name}
								/>
								<AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<div className="flex justify-between items-baseline">
									<h2 className="text-sm font-semibold truncate">
										{chat.name}
									</h2>
									<span className="text-xs text-gray-500">{chat.time}</span>
								</div>
								<p className="text-sm text-gray-500 truncate">
									{chat.lastMessage}
								</p>
							</div>
							{chat.unread > 0 && (
								<span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
									{chat.unread}
								</span>
							)}
						</div>
					))}
				</ScrollArea>
			</div>

			{/* Main Chat Area */}
			{selectedChat ? (
				<div className="flex-1 flex flex-col">
					<div className="p-4 bg-gray-200 flex items-center space-x-4">
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setSelectedChat(null)}
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<Avatar>
							<AvatarImage
								src={`https://ui-avatars.com/api/?name=${selectedChat.name}&background=random&size=40`}
								alt={selectedChat.name}
							/>
							<AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<h2 className="text-sm font-semibold">{selectedChat.name}</h2>
							<p className="text-xs text-gray-500">Online</p>
						</div>
						<Button variant="ghost" size="icon">
							<Search className="h-5 w-5" />
						</Button>
						<Button variant="ghost" size="icon">
							<MoreVertical className="h-5 w-5" />
						</Button>
					</div>
					<ScrollArea className="flex-1 p-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${
									message.sender === 'You' ? 'justify-end' : 'justify-start'
								} mb-4`}
							>
								<div
									className={`max-w-[70%] rounded-lg p-3 ${
										message.sender === 'You'
											? 'bg-green-500 text-white'
											: 'bg-white'
									}`}
								>
									<p className="text-sm">{message.content}</p>
									<span
										className={`text-xs mt-1 block text-right ${
											message.sender === 'You'
												? 'text-green-200'
												: 'text-gray-400'
										}`}
									>
										{message.time}
									</span>
								</div>
							</div>
						))}
					</ScrollArea>
					<div className="p-4 bg-gray-200 flex items-center space-x-2">
						<Button variant="ghost" size="icon">
							<Smile className="h-5 w-5" />
						</Button>
						<Button variant="ghost" size="icon">
							<Paperclip className="h-5 w-5" />
						</Button>
						<Input
							placeholder="Type a message"
							className="flex-1"
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
						/>
						<Button size="icon" onClick={handleSendMessage}>
							<Send className="h-5 w-5" />
						</Button>
					</div>
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center bg-gray-100">
					<p className="text-gray-500">Select a chat to start messaging</p>
				</div>
			)}
		</div>
	);
}
