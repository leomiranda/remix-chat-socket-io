import { useEffect } from 'react';

import { useSocket } from '~/context';

export default function Index() {
	const socket = useSocket();

	useEffect(() => {
		if (!socket) return;

		socket.on('event', (data) => {
			console.log(data);
		});

		socket.emit('event', 'ping');
	}, [socket]);

	return (
		<div>
			<h1 className="text-3xl font-bold underline">
				Welcome to Remix + Socket.io
			</h1>
			<div>
				<button type="button" onClick={() => socket?.emit('event', 'ping')}>
					Send ping
				</button>
			</div>
			<p>See Browser console and Server terminal</p>
		</div>
	);
}
