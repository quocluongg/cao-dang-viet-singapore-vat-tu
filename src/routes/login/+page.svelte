<script>
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	/** @param {SubmitEvent} e */
	async function handleLogin(e) {
		e.preventDefault();
		loading = true;
		error = null;

		const { data, error: err } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (err) {
			error = err.message;
			loading = false;
		} else {
			loading = false;
			goto('/');
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
			<div class="mb-8 flex flex-col items-center">
				<div
					class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30"
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
						<path d="M12 2L2 7l10 5 10-5-10-5z"></path>
						<path d="M2 17l10 5 10-5"></path>
						<path d="M2 12l10 5 10-5"></path>
					</svg>
				</div>
				<h2 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
					Chào mừng trở lại
				</h2>
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Đăng nhập vào hệ thống quản lý</p>
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

			<form onsubmit={handleLogin} class="space-y-5">
				<div>
					<label
						for="email"
						class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label
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

				<div>
					<div class="mb-2 flex items-center justify-between">
						<label for="password" class="text-sm font-semibold text-gray-700 dark:text-gray-300"
							>Mật khẩu</label
						>
						<a
							href="/forgot-password"
							class="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>Quên mật khẩu?</a
						>
					</div>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						placeholder="••••••••"
						class="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-900"
					/>
				</div>

				<div class="flex items-center">
					<label class="relative flex cursor-pointer items-center gap-3">
						<input type="checkbox" class="peer sr-only" id="rememberMe" />
						<div
							class="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white transition-all peer-checked:border-blue-600 peer-checked:bg-blue-600 dark:border-gray-600 dark:bg-gray-800"
						>
							<svg
								class="h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg
							>
						</div>
						<span class="text-sm font-medium text-gray-600 dark:text-gray-400"
							>Ghi nhớ đăng nhập</span
						>
					</label>
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
							ĐĂNG NHẬP
						{/if}
					</button>
				</div>
			</form>
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
