import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useSearchParams } from '@remix-run/react';
// import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx';
import { ErrorList, OTPField } from '~/components/forms.tsx';
import { Spacer } from '~/components/spacer.tsx';
import { StatusButton } from '~/components/ui/status-button.tsx';
import { Label } from '~/components/ui/label.tsx';
// import { checkHoneypot } from '~/utils/honeypot.server.ts';
import { useIsPending } from '~/utils/misc.tsx';
import { validateRequest } from './verify.server.ts';

export const codeQueryParam = 'code';
export const targetQueryParam = 'target';
export const typeQueryParam = 'type';
export const redirectToQueryParam = 'redirectTo';
const types = ['onboarding', 'reset-password', 'change-email'] as const;
const VerificationTypeSchema = z.enum(types);
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>;

export const VerifySchema = z.object({
	[codeQueryParam]: z.string().min(6).max(6),
	[typeQueryParam]: VerificationTypeSchema,
	[targetQueryParam]: z.string(),
	[redirectToQueryParam]: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	// checkHoneypot(formData);
	return validateRequest(request, formData);
}

export default function VerifyRoute() {
	const [searchParams] = useSearchParams();
	const isPending = useIsPending();
	const actionData = useActionData<typeof action>();
	const parseWithZoddType = VerificationTypeSchema.safeParse(
		searchParams.get(typeQueryParam)
	);
	const type = parseWithZoddType.success ? parseWithZoddType.data : null;

	const checkEmail = (
		<>
			<h1 className="text-h1">Check your email</h1>
			<p className="mt-3 text-body-md text-muted-foreground">
				We&apos;ve sent you a code to verify your email address.
			</p>
		</>
	);

	const headings: Record<VerificationTypes, React.ReactNode> = {
		onboarding: checkEmail,
		'reset-password': checkEmail,
		'change-email': checkEmail,
	};

	const [form, fields] = useForm({
		id: 'verify-form',
		constraint: getZodConstraint(VerifySchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: VerifySchema });
		},
		defaultValue: {
			code: searchParams.get(codeQueryParam),
			type: type,
			target: searchParams.get(targetQueryParam),
			redirectTo: searchParams.get(redirectToQueryParam),
		},
	});

	return (
		<main className="container flex min-h-[600px] flex-col justify-center pb-32 pt-20">
			<div className="text-center">
				{type ? headings[type] : 'Invalid Verification Type'}
			</div>

			<Spacer size="xs" />

			<div className="mx-auto w-full max-w-[400px] rounded-xl border border-border bg-card p-8 shadow-sm">
				<div>
					<ErrorList errors={form.errors} id={form.errorId} />
				</div>
				<Form method="POST" {...getFormProps(form)} className="flex-1">
					<div className="flex flex-col items-center gap-4">
						<Label
							htmlFor={fields[codeQueryParam].id}
							className="text-muted-foreground"
						>
							Enter verification code
						</Label>

						<OTPField
							labelProps={{}}
							inputProps={{
								...getInputProps(fields[codeQueryParam], { type: 'text' }),
								autoComplete: 'one-time-code',
								autoFocus: true,
							}}
							errors={fields[codeQueryParam].errors}
						/>
					</div>

					<input
						{...getInputProps(fields[typeQueryParam], { type: 'hidden' })}
					/>
					<input
						{...getInputProps(fields[targetQueryParam], { type: 'hidden' })}
					/>
					<input
						{...getInputProps(fields[redirectToQueryParam], { type: 'hidden' })}
					/>

					<StatusButton
						className="mt-6 w-full"
						status={isPending ? 'pending' : form.status ?? 'idle'}
						type="submit"
						disabled={isPending}
					>
						Verify Code
					</StatusButton>
				</Form>
			</div>
		</main>
	);
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />;
}
