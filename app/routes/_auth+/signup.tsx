import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Html, Container, Text, Link } from '@react-email/components';
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
// import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx';
import { ErrorList, Field } from '~/components/forms.tsx';
import { StatusButton } from '~/components/ui/status-button.tsx';

import { prisma } from '~/utils/db.server.ts';
import { sendEmail } from '~/utils/email.server.ts';
// import { checkHoneypot } from '~/utils/honeypot.server.ts';
import { useIsPending } from '~/utils/misc.tsx';
import { EmailSchema } from '~/utils/user-validation.ts';
import { prepareVerification } from './verify.server.ts';

const SignupSchema = z.object({
	email: EmailSchema,
});

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();

	// checkHoneypot(formData);

	const submission = await parseWithZod(formData, {
		schema: SignupSchema.superRefine(async (data, ctx) => {
			const existingUser = await prisma.user.findUnique({
				where: { email: data.email },
				select: { id: true },
			});
			if (existingUser) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this email',
				});
				return;
			}
		}),
		async: true,
	});
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 }
		);
	}
	const { email } = submission.value;
	const { verifyUrl, redirectTo, otp } = await prepareVerification({
		period: 10 * 60,
		request,
		type: 'onboarding',
		target: email,
	});

	const response = await sendEmail({
		to: email,
		subject: `Welcome to Remix Chat!`,
		react: <SignupEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
	});

	if (response.status === 'success') {
		return redirect(redirectTo.toString());
	} else {
		return json(
			{
				result: submission.reply({ formErrors: [response.error.message] }),
			},
			{
				status: 500,
			}
		);
	}
}

export function SignupEmail({
	onboardingUrl,
	otp,
}: {
	onboardingUrl: string;
	otp: string;
}) {
	return (
		<Html lang="en" dir="ltr">
			<Container>
				<h1>
					<Text>Welcome to Remix Chat!</Text>
				</h1>
				<p>
					<Text>
						Here&apos;s your verification code: <strong>{otp}</strong>
					</Text>
				</p>
				<p>
					<Text>Or click the link to get started:</Text>
				</p>
				<Link href={onboardingUrl}>{onboardingUrl}</Link>
			</Container>
		</Html>
	);
}

export const meta: MetaFunction = () => {
	return [{ title: 'Sign Up | Epic Notes' }];
};

export default function SignupRoute() {
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();

	const [form, fields] = useForm({
		id: 'signup-form',
		constraint: getZodConstraint(SignupSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			const result = parseWithZod(formData, { schema: SignupSchema });
			return result;
		},
		shouldRevalidate: 'onBlur',
	});

	return (
		<div className="container flex flex-col justify-center pb-32 pt-20">
			<div className="text-center">
				<h1 className="text-h1">Let&apos;s start your journey!</h1>
				<p className="mt-3 text-body-md text-muted-foreground">
					Please enter your email.
				</p>
			</div>
			<div className="mx-auto mt-16 min-w-full max-w-sm sm:min-w-[368px]">
				<Form method="POST" {...getFormProps(form)}>
					{/* <HoneypotInputs /> */}
					<Field
						labelProps={{
							htmlFor: fields.email.id,
							children: 'Email',
						}}
						inputProps={{
							...getInputProps(fields.email, { type: 'email' }),
							autoFocus: true,
							autoComplete: 'email',
						}}
						errors={fields.email.errors}
					/>
					<ErrorList errors={form.errors} id={form.errorId} />
					<StatusButton
						className="w-full"
						status={isPending ? 'pending' : form.status ?? 'idle'}
						type="submit"
						disabled={isPending}
					>
						Submit
					</StatusButton>
				</Form>
			</div>
		</div>
	);
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />;
}
