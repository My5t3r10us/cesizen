import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { hashPassword } from '../lib/auth/password';
import { eq } from 'drizzle-orm';

async function resetAdmin() {
  console.log('🔄 Resetting admin user...\n');
  
  const adminEmail = 'admin@cesizen.fr';
  const adminPassword = 'Admin123!';
  
  try {
    // Check if admin exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
    });

    if (existingAdmin) {
      console.log('📝 Admin user exists, updating password...');
      
      // Update existing admin
      await db
        .update(users)
        .set({
          passwordHash: hashPassword(adminPassword),
          isBanned: false, // Unban if banned
          role: 'admin',
        })
        .where(eq(users.email, adminEmail));
      
      console.log('✅ Admin user updated successfully!');
    } else {
      console.log('➕ Admin user does not exist, creating new one...');
      
      // Create new admin
      await db.insert(users).values({
        email: adminEmail,
        passwordHash: hashPassword(adminPassword),
        nom: 'Admin',
        prenom: 'CESIZen',
        role: 'admin',
        isBanned: false,
      });
      
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  Change this password after first login!');

  } catch (error) {
    console.error('❌ Error resetting admin:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetAdmin();
