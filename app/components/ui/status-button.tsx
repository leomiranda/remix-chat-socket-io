import * as React from 'react';
import { useSpinDelay } from 'spin-delay';
import { cn } from '~/lib/utils';
import { Button, type ButtonProps } from './button.tsx';
import { Loader2, Check, X } from 'lucide-react';

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './tooltip.tsx';

export const StatusButton = React.forwardRef<
	HTMLButtonElement,
	ButtonProps & {
		status: 'pending' | 'success' | 'error' | 'idle';
		message?: string | null;
		spinDelay?: Parameters<typeof useSpinDelay>[1];
	}
>(({ message, status, className, children, spinDelay, ...props }, ref) => {
	const delayedPending = useSpinDelay(status === 'pending', {
		delay: 400,
		minDuration: 300,
		...spinDelay,
	});
	const companion = {
		pending: delayedPending ? (
			<div
				role="status"
				className="inline-flex h-6 w-6 items-center justify-center"
			>
				<Loader2 className="h-4 w-4 animate-spin" />
			</div>
		) : null,
		success: (
			<div
				role="status"
				className="inline-flex h-6 w-6 items-center justify-center"
			>
				<Check className="h-4 w-4" />
			</div>
		),
		error: (
			<div
				role="status"
				className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive"
			>
				<X className="h-4 w-4 text-destructive-foreground" />
			</div>
		),
		idle: null,
	}[status];

	return (
		<Button
			ref={ref}
			className={cn('flex justify-center gap-4', className)}
			{...props}
		>
			<div>{children}</div>
			{message ? (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>{companion}</TooltipTrigger>
						<TooltipContent>{message}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			) : (
				companion
			)}
		</Button>
	);
});
StatusButton.displayName = 'Button';
