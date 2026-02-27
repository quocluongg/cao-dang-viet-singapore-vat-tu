<script>
	import { supabase } from '$lib/supabaseClient';
	import { fade, fly } from 'svelte/transition';

	let email = $state('');
	let loading = $state(false);
	/** @type {string | null} */
	let error = $state(null);
	/** @type {string | null} */
	let message = $state(null);

	/** @param {SubmitEvent} e */
	async function handleResetPassword(e) {
		e.preventDefault();
		loading = true;
		error = null;
		message = null;

		const { data, error: err } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/auth/update-password`
		});

		if (err) {
			error = err.message;
			loading = false;
		} else {
			loading = false;
			message = 'Vui lòng kiểm tra email của bạn để nhận liên kết đặt lại mật khẩu.';
		}
	}
</script>

<div
	class="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4 font-sans dark:bg-gray-950"
>
	<div
		in:fly={{ y: 20, duration: 600, delay: 100 }}
		class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 shadow-blue-900/5 ring-gray-100 dark:bg-gray-900 dark:shadow-black/40 dark:ring-gray-800"
	>
		<div class="p-8 sm:p-10">
			<a
				href="/login"
				class="mb-6 inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="mr-1"
					><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"
					></polyline></svg
				>
				Quay lại đăng nhập
			</a>

			<div class="mb-8 flex flex-col items-start">
				<div
					class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
						<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
					</svg>
				</div>
				<h2 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
					Quên mật khẩu?
				</h2>
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					Đừng lo lắng, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu thông qua địa chỉ email của
					bạn.
				</p>
			</div>

			{#if error}
				<div
					transition:fade
					class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
				>
					<div class="flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"
							></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg
						>
						<span class="font-medium">{error}</span>
					</div>
				</div>
			{/if}

			{#if message}
				<div
					transition:fade
					class="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
				>
					<div class="flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline
								points="22 4 12 14.01 9 11.01"
							></polyline></svg
						>
						<span class="font-medium">{message}</span>
					</div>
				</div>
			{:else}
				<form onsubmit={handleResetPassword} class="space-y-5">
					<div>
						<label
							for="email"
							class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
							>Email đã đăng ký</label
						>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							placeholder="admin@caodang.edu.vn"
							class="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-900"
						/>
					</div>

					<div class="pt-2">
						<button
							type="submit"
							disabled={loading}
							class="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold tracking-wide text-white transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-blue-600"
						>
							{#if loading}
								<svg
									class="mr-3 h-5 w-5 animate-spin text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									><circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle><path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path></svg
								>
								ĐANG XỬ LÝ...
							{:else}
								GỬI YÊU CẦU
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>

		<div
			class="border-t border-gray-100 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-900/50"
		>
			<p class="text-sm text-gray-600 dark:text-gray-400">
				Chưa có tài khoản?
				<a
					href="/signup"
					class="font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
					>Tạo tài khoản mới</a
				>
			</p>
		</div>
	</div>
</div>
