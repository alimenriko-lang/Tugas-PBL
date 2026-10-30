import db from './Config/db.mjs';
import Users from './models/userModel.mjs';

async function runTests() {
  console.log('=== PENGUJIAN OAUTH MODEL & DATABASE ===');

  try {
    // 1. Verify schema columns
    const [cols] = await db.query('DESCRIBE users');
    const columnNames = cols.map(c => c.Field);
    console.log('Daftar kolom tabel users:', columnNames.join(', '));

    const requiredCols = ['auth_provider', 'provider_id', 'avatar_url', 'password'];
    for (const col of requiredCols) {
      if (!columnNames.includes(col)) {
        throw new Error(`Kolom ${col} tidak ditemukan pada tabel users!`);
      }
    }
    console.log('✓ PASS: Semua kolom OAuth (auth_provider, provider_id, avatar_url, password) tersedia.');

    // 2. Buat akun OAuth simulasi (Google)
    const testGoogleEmail = `google.user.${Date.now()}@gmail.com`;
    const testGoogleId = `google_sub_${Date.now()}`;
    const testGoogleAvatar = 'https://lh3.googleusercontent.com/a/sample-avatar';

    const googleUserId = await Users.createOAuthUser({
      name: 'Tester Google TaskEco',
      email: testGoogleEmail,
      auth_provider: 'google',
      provider_id: testGoogleId,
      avatar_url: testGoogleAvatar
    });
    console.log(`✓ PASS: Akun OAuth Google berhasil dibuat dengan ID: ${googleUserId}`);

    // 3. Ambil data akun berdasarkan provider & provider_id
    const fetchedGoogleUser = await Users.getByProviderId('google', testGoogleId);
    if (!fetchedGoogleUser || fetchedGoogleUser.id !== googleUserId) {
      throw new Error('Gagal mengambil user berdasarkan provider_id!');
    }
    if (fetchedGoogleUser.password !== null) {
      throw new Error('Password user OAuth harus bernilai NULL!');
    }
    console.log('✓ PASS: getByProviderId berhasil menemukan user dan password NULL.');

    // 4. Buat akun OAuth simulasi (GitHub)
    const testGithubEmail = `github.user.${Date.now()}@users.noreply.github.com`;
    const testGithubId = `gh_${Date.now()}`;
    const testGithubAvatar = 'https://avatars.githubusercontent.com/u/sample';

    const githubUserId = await Users.createOAuthUser({
      name: 'Tester GitHub TaskEco',
      email: testGithubEmail,
      auth_provider: 'github',
      provider_id: testGithubId,
      avatar_url: testGithubAvatar
    });
    console.log(`✓ PASS: Akun OAuth GitHub berhasil dibuat dengan ID: ${githubUserId}`);

    // 5. Uji isolasi antar provider
    const notFoundCrossProvider = await Users.getByProviderId('google', testGithubId);
    if (notFoundCrossProvider !== null) {
      throw new Error('Cross-provider collision: user ditemukan di provider yang salah!');
    }
    console.log('✓ PASS: Isolasi antar provider OAuth terjaga ketat.');

    // 6. Uji linkOAuthProvider
    await Users.linkOAuthProvider(googleUserId, {
      auth_provider: 'google',
      provider_id: testGoogleId,
      avatar_url: 'https://lh3.googleusercontent.com/a/sample-avatar-v2'
    });
    const updatedUser = await Users.getById(googleUserId);
    if (updatedUser.avatar_url !== 'https://lh3.googleusercontent.com/a/sample-avatar-v2') {
      throw new Error('linkOAuthProvider gagal memperbarui avatar_url!');
    }
    console.log('✓ PASS: linkOAuthProvider berhasil memperbarui profil provider.');

    // 7. Cleanup test data
    await Users.deleteWithTasks(googleUserId);
    await Users.deleteWithTasks(githubUserId);
    console.log('✓ PASS: Data pengujian berhasil dibersihkan.');

    console.log('\n=============================================');
    console.log('SEMUA PENGUJIAN OAUTH DATABASE BERHASIL!');
    console.log('=============================================\n');
  } catch (err) {
    console.error('Pengujian Gagal:', err);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

runTests();
